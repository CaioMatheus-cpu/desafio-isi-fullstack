import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AgilityBar, Avatar, ConditionBadge, PositionBadge } from './Badges'

describe('ConditionBadge', () => {
  it('escreve a condição, sem depender só da cor', () => {
    render(<ConditionBadge condition="MAL_CONDICIONADO" />)
    expect(screen.getByText('Mal condicionado')).toBeInTheDocument()
  })

  it('usa a cor de cada condição', () => {
    const { rerender } = render(<ConditionBadge condition="APTO" />)
    expect(screen.getByText('Apto')).toHaveClass('badge-success')
    rerender(<ConditionBadge condition="DOENTE" />)
    expect(screen.getByText('Doente')).toHaveClass('badge-destructive')
  })
})

describe('PositionBadge', () => {
  it('mostra a sigla da posição', () => {
    render(<PositionBadge position="ZAG" />)
    expect(screen.getByText('ZAG')).toBeInTheDocument()
  })
})

describe('Avatar', () => {
  it('usa as iniciais do primeiro e do último nome', () => {
    render(<Avatar name="André Silva Lacerda" />)
    expect(screen.getByText('AL')).toBeInTheDocument()
  })

  it('com um nome só usa uma letra', () => {
    render(<Avatar name="Pelé" />)
    expect(screen.getByText('P')).toBeInTheDocument()
  })
})

describe('AgilityBar', () => {
  it('mostra o número e preenche a barra pela agilidade', () => {
    const { container } = render(<AgilityBar value={81} />)
    expect(screen.getByText('81')).toBeInTheDocument()
    const fill = container.querySelector('.agility-fill')
    expect(fill).toHaveClass('agility-good')
    expect(fill).toHaveStyle({ width: '81%' })
  })

  it('agilidade baixa fica em vermelho', () => {
    const { container } = render(<AgilityBar value={12} />)
    expect(container.querySelector('.agility-fill')).toHaveClass('agility-bad')
  })
})
