import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormField } from './FormField'

describe('FormField', () => {
  it('liga o rótulo ao campo', () => {
    render(
      <FormField label="Nome" htmlFor="name">
        <input id="name" />
      </FormField>,
    )

    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
  })

  it('liga o erro ao campo para o leitor de tela e marca o campo como inválido', () => {
    render(
      <FormField label="Idade" htmlFor="age" error="Use uma idade de 16 a 45 anos.">
        <input id="age" />
      </FormField>,
    )

    const field = screen.getByLabelText('Idade')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAccessibleDescription('Use uma idade de 16 a 45 anos.')
  })

  it('sem erro, o campo é descrito pela dica e não fica inválido', () => {
    render(
      <FormField label="Nome" htmlFor="name" hint="De 3 a 100 caracteres.">
        <input id="name" />
      </FormField>,
    )

    const field = screen.getByLabelText('Nome')
    expect(field).not.toHaveAttribute('aria-invalid')
    expect(field).toHaveAccessibleDescription('De 3 a 100 caracteres.')
  })

  it('encontra o campo mesmo dentro de um quadro com ícone', () => {
    render(
      <FormField label="Clube comprador" htmlFor="club" error="Escolha o clube comprador.">
        <div className="select-icon">
          <svg aria-hidden="true" />
          <select id="club">
            <option value="">Escolha</option>
          </select>
        </div>
      </FormField>,
    )

    expect(screen.getByLabelText('Clube comprador')).toHaveAccessibleDescription(
      'Escolha o clube comprador.',
    )
  })
})
