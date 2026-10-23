import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import { NoticeProvider } from '../components/NoticeProvider'
import { useAction } from './useAction'
import { useDebouncedValue } from './useDebouncedValue'
import { useNotice } from './notice-context'
import { useRequest } from './useRequest'

function wrapper({ children }: { children: ReactNode }) {
  return <NoticeProvider>{children}</NoticeProvider>
}

describe('useRequest', () => {
  it('começa carregando e entrega os dados quando a resposta chega', async () => {
    const { result } = renderHook(() => useRequest(() => Promise.resolve(['a', 'b']), 'lista'))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeUndefined()

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual(['a', 'b'])
    expect(result.current.error).toBeUndefined()
  })

  it('guarda a mensagem e o status quando a API recusa', async () => {
    const loader = () => Promise.reject(new ApiError(404, 'Clube não encontrado.'))
    const { result } = renderHook(() => useRequest(loader, 'clube'))

    await waitFor(() => expect(result.current.error).toBe('Clube não encontrado.'))
    expect(result.current.errorStatus).toBe(404)
    expect(result.current.loading).toBe(false)
  })

  it('pede de novo quando a chave muda ou quando chamam reload', async () => {
    const loader = vi.fn(() => Promise.resolve('ok'))
    const { result, rerender } = renderHook(({ key }) => useRequest(loader, key), {
      initialProps: { key: 'pagina-1' },
    })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(loader).toHaveBeenCalledTimes(1)

    rerender({ key: 'pagina-2' })
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(2))

    act(() => result.current.reload())
    await waitFor(() => expect(loader).toHaveBeenCalledTimes(3))
  })

  it('ignora a resposta antiga quando um pedido mais novo já saiu', async () => {
    const slow = new Promise<string>((resolve) => setTimeout(() => resolve('antiga'), 30))
    const loaders: Record<string, () => Promise<string>> = {
      velha: () => slow,
      nova: () => Promise.resolve('nova'),
    }
    const { result, rerender } = renderHook(({ key }) => useRequest(loaders[key]!, key), {
      initialProps: { key: 'velha' },
    })
    rerender({ key: 'nova' })

    await waitFor(() => expect(result.current.data).toBe('nova'))
    await act(async () => {
      await slow
    })
    expect(result.current.data).toBe('nova')
  })
})

describe('useAction', () => {
  it('devolve o resultado e mostra o aviso de sucesso', async () => {
    const { result } = renderHook(() => ({ action: useAction(), notice: useNotice() }), { wrapper })

    let outcome: Awaited<ReturnType<typeof result.current.action.run<string>>> | undefined
    await act(async () => {
      outcome = await result.current.action.run(() => Promise.resolve('feito'), 'Salvo.')
    })

    expect(outcome).toEqual({ ok: true, value: 'feito' })
    expect(result.current.notice.notices).toMatchObject([{ kind: 'success', text: 'Salvo.' }])
  })

  it('mostra a mensagem da API quando a ação é recusada', async () => {
    const { result } = renderHook(() => ({ action: useAction(), notice: useNotice() }), { wrapper })

    let outcome: { ok: boolean } | undefined
    await act(async () => {
      outcome = await result.current.action.run(
        () => Promise.reject(new ApiError(409, 'Jogador doente não pode ser escalado.')),
        'Salvo.',
      )
    })

    expect(outcome?.ok).toBe(false)
    expect(result.current.notice.notices).toMatchObject([
      { kind: 'error', text: 'Jogador doente não pode ser escalado.' },
    ])
  })

  it('ignora o segundo clique enquanto a primeira ação ainda roda', async () => {
    const { result } = renderHook(() => useAction(), { wrapper })
    let finish: (value: string) => void = () => undefined
    const action = vi.fn(() => new Promise<string>((resolve) => (finish = resolve)))

    let first: Promise<unknown> = Promise.resolve()
    act(() => {
      first = result.current.run(action, 'ok')
    })
    expect(result.current.busy).toBe(true)

    let second: { ok: boolean } | undefined
    await act(async () => {
      second = await result.current.run(action, 'ok')
    })
    expect(second?.ok).toBe(false)
    expect(action).toHaveBeenCalledTimes(1)

    await act(async () => {
      finish('pronto')
      await first
    })
    expect(result.current.busy).toBe(false)
  })
})

describe('useDebouncedValue', () => {
  it('só entrega o valor novo depois de um tempo sem mudanças', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'ab' })
    rerender({ value: 'abc' })

    expect(result.current).toBe('a')
    await waitFor(() => expect(result.current).toBe('abc'))
  })
})
