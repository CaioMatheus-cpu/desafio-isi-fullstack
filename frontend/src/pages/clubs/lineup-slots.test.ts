import { describe, expect, it } from 'vitest'
import { makePlayer } from '../../test/fixtures'
import { FORMATION_SLOTS, assignStarters, usedAttributes } from './lineup-slots'

describe('FORMATION_SLOTS', () => {
  it('toda formação tem o goleiro e mais 4 vagas de linha', () => {
    for (const slots of Object.values(FORMATION_SLOTS)) {
      expect(slots).toHaveLength(5)
      expect(slots[0]?.positions).toEqual(['GOL'])
    }
  })

  it('a 2-1-1 pede 2 defensores, 1 meia e 1 atacante', () => {
    expect(FORMATION_SLOTS['2-1-1'].map((slot) => slot.title)).toEqual([
      'Goleiro',
      'Defesa',
      'Defesa',
      'Meio',
      'Ataque',
    ])
  })
})

describe('assignStarters', () => {
  const starters = [
    makePlayer({ id: 1, position: 'GOL' }),
    makePlayer({ id: 2, position: 'LAT' }),
    makePlayer({ id: 3, position: 'ZAG' }),
    makePlayer({ id: 4, position: 'MEI' }),
    makePlayer({ id: 5, position: 'ATA' }),
  ]

  it('distribui os titulares pelas vagas da formação', () => {
    expect(assignStarters('2-1-1', starters)).toEqual(['1', '2', '3', '4', '5'])
  })

  it('deixa a vaga vazia quando falta alguém da posição', () => {
    expect(assignStarters('3-1', starters)).toEqual(['1', '2', '3', '', '5'])
  })

  it('sem formação, todas as vagas ficam vazias', () => {
    expect(assignStarters(null, starters)).toEqual(['', '', '', '', ''])
  })
})

describe('usedAttributes (RN20)', () => {
  it('o goleiro só defende', () => {
    const keeper = makePlayer({ position: 'GOL', defending: 74 })
    expect(usedAttributes(0, keeper)).toEqual([{ label: 'Defesa', value: 74 }])
  })

  it('o 1º jogador de linha só defende', () => {
    const defender = makePlayer({ position: 'ZAG', defending: 83 })
    expect(usedAttributes(1, defender)).toEqual([{ label: 'Defesa', value: 83 }])
  })

  it('o 2º jogador de linha ataca com drible e defende', () => {
    const fullback = makePlayer({ position: 'LAT', dribbling: 74, defending: 66 })
    expect(usedAttributes(2, fullback)).toEqual([
      { label: 'Drible', value: 74 },
      { label: 'Defesa', value: 66 },
    ])
  })

  it('o 3º e o 4º só atacam, cada um com o atributo da sua posição', () => {
    expect(usedAttributes(3, makePlayer({ position: 'MEI', passing: 70 }))).toEqual([
      { label: 'Passe', value: 70 },
    ])
    expect(usedAttributes(4, makePlayer({ position: 'ATA', shooting: 79 }))).toEqual([
      { label: 'Finalização', value: 79 },
    ])
  })
})
