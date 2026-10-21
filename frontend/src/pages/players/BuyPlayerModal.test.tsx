import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../api/client'
import { listClubs } from '../../api/clubs'
import { buyPlayer } from '../../api/market'
import { makeClub, makePlayer, makePurchase } from '../../test/fixtures'
import { BuyPlayerModal } from './BuyPlayerModal'

vi.mock('../../api/clubs', () => ({ listClubs: vi.fn() }))
vi.mock('../../api/market', () => ({ buyPlayer: vi.fn(), sellPlayer: vi.fn() }))

function renderModal() {
  const onBought = vi.fn()
  render(
    <MemoryRouter>
      <BuyPlayerModal player={makePlayer()} onClose={() => undefined} onBought={onBought} />
    </MemoryRouter>,
  )
  return onBought
}

async function chooseClubAndConfirm() {
  await userEvent.selectOptions(await screen.findByLabelText('Clube comprador'), '1')
  await userEvent.click(screen.getByRole('button', { name: /Confirmar compra/ }))
}

describe('BuyPlayerModal', () => {
  beforeEach(() => {
    vi.mocked(listClubs).mockResolvedValue([makeClub()])
  })

  it('mostra o jogador e o limite de 50% do caixa do clube escolhido', async () => {
    renderModal()
    await userEvent.selectOptions(await screen.findByLabelText('Clube comprador'), '1')

    expect(screen.getByText('Eduardo Paiva')).toBeInTheDocument()
    expect(screen.getByText(/Caixa atual: 300,00/)).toBeInTheDocument()
  })

  it('não envia a compra sem escolher o clube', async () => {
    renderModal()
    await screen.findByLabelText('Clube comprador')
    await userEvent.click(screen.getByRole('button', { name: /Confirmar compra/ }))

    expect(screen.getByText('Escolha o clube comprador.')).toBeInTheDocument()
    expect(buyPlayer).not.toHaveBeenCalled()
  })

  it('mostra a recusa da API dentro da janela, sem fechá-la', async () => {
    vi.mocked(buyPlayer).mockRejectedValue(
      new ApiError(409, 'O custo da compra (105,00) passa do limite de 50% do caixa (90,92).'),
    )
    const onBought = renderModal()
    await chooseClubAndConfirm()

    expect(await screen.findByText('Compra recusada')).toBeInTheDocument()
    expect(screen.getByText(/passa do limite de 50% do caixa/)).toBeInTheDocument()
    expect(onBought).not.toHaveBeenCalled()
  })

  it('avisa quando não há conexão e oferece tentar de novo', async () => {
    vi.mocked(buyPlayer).mockRejectedValue(new ApiError(0, 'Não foi possível conectar à API.'))
    renderModal()
    await chooseClubAndConfirm()

    expect(await screen.findByText('Sem conexão')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tentar de novo/ })).toBeInTheDocument()
  })

  it('mostra o resultado da compra como a API devolveu', async () => {
    vi.mocked(buyPlayer).mockResolvedValue(makePurchase())
    const onBought = renderModal()
    await chooseClubAndConfirm()

    expect(await screen.findByText('Compra concluída')).toBeInTheDocument()
    expect(screen.getByText('Eduardo Paiva agora é do Águias FC.')).toBeInTheDocument()
    expect(screen.getByText('2,30')).toBeInTheDocument()
    expect(screen.getByText('48,30')).toBeInTheDocument()
    expect(screen.getByText('251,70')).toBeInTheDocument()
    expect(screen.getByText('ATIVO')).toBeInTheDocument()
    expect(onBought).toHaveBeenCalledTimes(1)
  })

  it('manda o fim da fidelidade com o fuso de Brasília', async () => {
    vi.mocked(buyPlayer).mockResolvedValue(makePurchase())
    renderModal()
    await chooseClubAndConfirm()

    await screen.findByText('Compra concluída')
    const [, body] = vi.mocked(buyPlayer).mock.calls[0] ?? []
    expect(body?.club_id).toBe(1)
    expect(body?.loyalty_until).toMatch(/^\d{4}-\d{2}-\d{2}T15:00-03:00$/)
  })
})
