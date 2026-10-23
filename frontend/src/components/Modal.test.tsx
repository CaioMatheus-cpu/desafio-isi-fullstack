import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

function Harness({ onClose = () => undefined }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir janela
      </button>
      {open && (
        <Modal
          title="Nova coisa"
          onClose={() => {
            onClose()
            setOpen(false)
          }}
        >
          <input aria-label="Primeiro campo" />
          <button type="button">Salvar</button>
        </Modal>
      )}
    </>
  )
}

describe('Modal', () => {
  it('é uma janela nomeada pelo título', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir janela' }))

    expect(screen.getByRole('dialog', { name: 'Nova coisa' })).toHaveAttribute('aria-modal', 'true')
  })

  it('leva o foco do teclado para dentro da janela ao abrir', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir janela' }))

    expect(screen.getByRole('dialog')).toHaveFocus()
  })

  it('o Tab dá a volta dentro da janela, sem escapar para a página', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Abrir janela' }))

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByLabelText('Primeiro campo')).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Fechar' })).toHaveFocus()
    await userEvent.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Salvar' })).toHaveFocus()
  })

  it('fecha com Esc e devolve o foco ao botão que abriu a janela', async () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    const opener = screen.getByRole('button', { name: 'Abrir janela' })
    await userEvent.click(opener)

    await userEvent.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })
})
