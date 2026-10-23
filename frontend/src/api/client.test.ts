import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_URL } from '../config'
import { ApiError, request } from './client'

function respond(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), { status })
}

describe('cliente HTTP', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('monta a URL sem os parâmetros vazios', async () => {
    fetchMock.mockResolvedValue(respond(200, []))
    await request('/players', { query: { search: '', page: 2, free: undefined, sort: 'name' } })

    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API_URL}/players?page=2&sort=name`)
  })

  it('codifica os valores da consulta', async () => {
    fetchMock.mockResolvedValue(respond(200, []))
    await request('/players', { query: { search: 'João & Cia' } })

    expect(fetchMock.mock.calls[0]?.[0]).toBe(`${API_URL}/players?search=Jo%C3%A3o+%26+Cia`)
  })

  it('envia o corpo como JSON, só quando há corpo', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(respond(200, { id: 1 })))
    await request('/clubs', { method: 'POST', body: { name: 'Delta FC' } })
    await request('/clubs')

    const [, withBody] = fetchMock.mock.calls[0] ?? []
    expect(withBody?.method).toBe('POST')
    expect(withBody?.body).toBe('{"name":"Delta FC"}')
    expect(withBody?.headers).toEqual({ 'Content-Type': 'application/json' })
    const [, withoutBody] = fetchMock.mock.calls[1] ?? []
    expect(withoutBody?.body).toBeUndefined()
    expect(withoutBody?.headers).toBeUndefined()
  })

  it('devolve o JSON da resposta e undefined no 204', async () => {
    fetchMock.mockResolvedValueOnce(respond(200, { id: 7 }))
    fetchMock.mockResolvedValueOnce(respond(204))

    expect(await request('/players/7')).toEqual({ id: 7 })
    expect(await request('/players/7', { method: 'DELETE' })).toBeUndefined()
  })

  it('transforma a recusa da API em ApiError com a mensagem e o status', async () => {
    fetchMock.mockResolvedValue(respond(409, { message: 'O elenco já tem 12 jogadores.' }))

    await expect(request('/players/1/buy', { method: 'POST' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      message: 'O elenco já tem 12 jogadores.',
    })
  })

  it('usa uma mensagem genérica quando a recusa não vem em JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad Gateway</html>', { status: 502 }))

    const error = await request('/players').catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(502)
    expect((error as ApiError).message).toBe('Ocorreu um erro inesperado.')
  })

  it('quando a API não responde, o erro tem status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(request('/players')).rejects.toMatchObject({ status: 0 })
  })
})
