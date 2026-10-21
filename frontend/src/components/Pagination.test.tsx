import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './Pagination'

function renderPagination(page: number, onChange = vi.fn()) {
  render(
    <Pagination
      page={page}
      totalPages={3}
      totalItems={23}
      pageSize={10}
      singular="jogador"
      plural="jogadores"
      onChange={onChange}
    />,
  )
  return onChange
}

describe('Pagination', () => {
  it('mostra o intervalo da página atual', () => {
    renderPagination(1)
    expect(screen.getByText('Mostrando 1–10 de 23 jogadores')).toBeInTheDocument()
  })

  it('na última página mostra só o que sobrou', () => {
    renderPagination(3)
    expect(screen.getByText('Mostrando 21–23 de 23 jogadores')).toBeInTheDocument()
  })

  it('desabilita "Anterior" na primeira página e "Próxima" na última', () => {
    renderPagination(1)
    expect(screen.getByRole('button', { name: /Anterior/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Próxima/ })).toBeEnabled()
  })

  it('vai para a página escolhida', async () => {
    const onChange = renderPagination(1)
    await userEvent.click(screen.getByRole('button', { name: 'Página 2' }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('marca a página atual', () => {
    renderPagination(2)
    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')
  })
})
