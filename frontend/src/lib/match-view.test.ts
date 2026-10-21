import { describe, expect, it } from 'vitest'
import { makeMatch } from '../test/fixtures'
import {
  attackIndexOf,
  attackerLine,
  buildTeams,
  defenderLine,
  formationGroups,
  lineLabel,
  placeTeam,
} from './match-view'

describe('linhas dos duelos (RN20)', () => {
  it('o 1º ataque é do 4º jogador de linha contra o goleiro', () => {
    expect(attackerLine(0)).toBe(4)
    expect(defenderLine(0)).toBe(0)
  })

  it('o 2º ataque é do 3º contra o 1º, e o 3º é do 2º contra o 2º', () => {
    expect([attackerLine(1), defenderLine(1)]).toEqual([3, 1])
    expect([attackerLine(2), defenderLine(2)]).toEqual([2, 2])
  })

  it('descobre qual dos 3 ataques do time é o duelo', () => {
    const match = makeMatch()
    expect(match.duels.map((duel) => attackIndexOf(match.duels, duel))).toEqual([0, 1, 2, 0, 1, 2])
  })

  it('escreve a linha do jogador', () => {
    expect(lineLabel('GOL', 0)).toBe('Goleiro')
    expect(lineLabel('ATA', 4)).toBe('ATA, 4º de linha')
  })
})

describe('formationGroups', () => {
  it('separa defesa, meio e ataque', () => {
    expect(formationGroups('2-1-1')).toEqual({ defense: 2, midfield: 1, attack: 1 })
    expect(formationGroups('1-2-1')).toEqual({ defense: 1, midfield: 2, attack: 1 })
  })

  it('nas formações de 2 números não há meio', () => {
    expect(formationGroups('3-1')).toEqual({ defense: 3, midfield: 0, attack: 1 })
    expect(formationGroups('2-2')).toEqual({ defense: 2, midfield: 0, attack: 2 })
  })
})

describe('buildTeams', () => {
  const [home, away] = buildTeams(makeMatch())

  it('reúne os 5 titulares de cada clube a partir dos duelos', () => {
    expect(home.players).toHaveLength(5)
    expect(away.players).toHaveLength(5)
    expect(home.name).toBe('Delta FC')
    expect(home.goals).toBe(2)
  })

  it('põe cada titular na linha certa', () => {
    const lines = Object.fromEntries(home.players.map((player) => [player.name, player.line]))
    expect(lines).toEqual({
      'Gabriel Antunes': 4,
      'Meia Lua': 3,
      'Kauã Ribeiro': 2,
      'André Lacerda': 0,
      'Danilo Freitas': 1,
    })
  })

  it('junta o que o mesmo jogador usou ao atacar e ao defender', () => {
    const lateral = home.players.find((player) => player.name === 'Kauã Ribeiro')
    expect(lateral?.uses).toEqual([
      { short: 'Dri', value: 75 },
      { short: 'Def', value: 63 },
    ])
  })

  it('marca quem fez gol no duelo', () => {
    expect(home.players.find((player) => player.name === 'Gabriel Antunes')?.scored).toBe(true)
    expect(home.players.find((player) => player.name === 'Meia Lua')?.scored).toBe(false)
  })

  it('guarda a condição do jogador', () => {
    expect(away.players.find((player) => player.name === 'Diego Ramos')?.condition).toBe(
      'MAL_CONDICIONADO',
    )
  })
})

describe('placeTeam', () => {
  const [home] = buildTeams(makeMatch())

  it('põe o goleiro no fundo e uma coluna por setor da formação', () => {
    const placements = placeTeam(home, false)
    const byName = Object.fromEntries(placements.map((item) => [item.player.name, item]))
    expect(byName['André Lacerda']?.x).toBe(6)
    expect(byName['Danilo Freitas']?.x).toBe(20)
    expect(byName['Meia Lua']?.x).toBe(33)
    expect(byName['Gabriel Antunes']?.x).toBe(45)
  })

  it('espelha o visitante', () => {
    const mirrored = placeTeam(home, true).find((item) => item.player.name === 'André Lacerda')
    expect(mirrored?.x).toBe(94)
  })
})
