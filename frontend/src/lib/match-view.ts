import type { Condition, Duel, Match, Position } from '../api/types'

export const ATTRIBUTE_NAMES: Record<string, { short: string; long: string }> = {
  shooting: { short: 'Fin', long: 'Finalização' },
  passing: { short: 'Pas', long: 'Passe' },
  dribbling: { short: 'Dri', long: 'Drible' },
  defending: { short: 'Def', long: 'Defesa' },
}

export const RESULT_LABELS = {
  MANDANTE: 'Vitória do mandante',
  VISITANTE: 'Vitória do visitante',
  EMPATE: 'Empate',
} as const

export interface FieldPlayer {
  id: number
  name: string
  position: Position
  condition: Condition
  // 0 é o goleiro; 1 a 4 são os jogadores de linha, do mais recuado ao mais avançado.
  line: number
  // Os valores que esse titular usou nos duelos (já com o efeito da condição).
  uses: { short: string; value: number }[]
  scored: boolean
}

export interface TeamView {
  clubId: number
  name: string
  formation: string
  goals: number
  players: FieldPlayer[]
}

// RN20: em cada time, o 1º ataque é do 4º jogador de linha contra o goleiro, o 2º
// do 3º contra o 1º, e o 3º do 2º contra o 2º do adversário.
export function attackerLine(attackIndex: number): number {
  return 4 - attackIndex
}

export function defenderLine(attackIndex: number): number {
  return attackIndex === 0 ? 0 : attackIndex
}

// Qual dos 3 ataques do time (0, 1 ou 2) é este duelo.
export function attackIndexOf(duels: Duel[], duel: Duel): number {
  return duels.filter(
    (other) => other.attacking_club_id === duel.attacking_club_id && other.order < duel.order,
  ).length
}

export function lineLabel(position: Position, line: number): string {
  return position === 'GOL' && line === 0 ? 'Goleiro' : `${position}, ${line}º de linha`
}

// Reúne, a partir dos 6 duelos que a API devolveu, os 5 titulares de cada clube
// com o que usaram em campo. Nenhum valor é calculado aqui.
export function buildTeams(match: Match): [TeamView, TeamView] {
  const sides = [match.home, match.away].map<TeamView>((side) => ({
    clubId: side.club_id,
    name: side.club_name,
    formation: side.formation,
    goals: side.goals,
    players: [],
  }))

  function register(team: TeamView, side: Duel['attacker'], line: number, scored: boolean) {
    let player = team.players.find((item) => item.id === side.player_id)
    if (!player) {
      player = {
        id: side.player_id,
        name: side.player_name,
        position: side.position,
        condition: side.condition,
        line,
        uses: [],
        scored: false,
      }
      team.players.push(player)
    }
    const names = ATTRIBUTE_NAMES[side.attribute]
    player.uses.push({ short: names?.short ?? side.attribute, value: side.value })
    player.scored = player.scored || scored
  }

  for (const duel of match.duels) {
    const index = attackIndexOf(match.duels, duel)
    const attacking = sides.find((team) => team.clubId === duel.attacking_club_id)
    const defending = sides.find((team) => team.clubId !== duel.attacking_club_id)
    if (attacking && defending) {
      register(attacking, duel.attacker, attackerLine(index), duel.goal)
      register(defending, duel.defender, defenderLine(index), false)
    }
  }

  return [sides[0], sides[1]] as [TeamView, TeamView]
}

// "2-1-1" vira defesa 2, meio 1, ataque 1; "3-1" vira defesa 3, ataque 1.
export function formationGroups(formation: string): {
  defense: number
  midfield: number
  attack: number
} {
  const parts = formation.split('-').map(Number)
  if (parts.length === 2) {
    return { defense: parts[0] ?? 0, midfield: 0, attack: parts[1] ?? 0 }
  }
  return { defense: parts[0] ?? 0, midfield: parts[1] ?? 0, attack: parts[2] ?? 0 }
}

export interface Placement {
  player: FieldPlayer
  // Posição no campo, em porcentagem, já espelhada para o time visitante.
  x: number
  y: number
}

const COLUMNS_THREE = [6, 27, 44]
const COLUMNS_FOUR = [6, 20, 33, 45]
const ROWS: Record<number, number[]> = { 1: [50], 2: [30, 70], 3: [20, 50, 80] }

// Distribui os titulares do time pelo campo: goleiro no fundo e uma coluna por
// grupo da formação. O visitante é o espelho do mandante.
export function placeTeam(team: TeamView, mirrored: boolean): Placement[] {
  const groups = formationGroups(team.formation)
  const columns = groups.midfield > 0 ? COLUMNS_FOUR : COLUMNS_THREE
  const sizes =
    groups.midfield > 0
      ? [groups.defense, groups.midfield, groups.attack]
      : [groups.defense, groups.attack]

  const placements: Placement[] = []
  const goalkeeper = team.players.find((player) => player.line === 0)
  if (goalkeeper) {
    placements.push({ player: goalkeeper, x: columns[0] ?? 6, y: 50 })
  }
  let line = 1
  sizes.forEach((size, groupIndex) => {
    for (let slot = 0; slot < size; slot += 1) {
      const player = team.players.find((item) => item.line === line)
      line += 1
      if (player) {
        const y = ROWS[size]?.[slot] ?? 50
        placements.push({ player, x: columns[groupIndex + 1] ?? 30, y })
      }
    }
  })

  return placements.map((placement) => ({
    ...placement,
    x: mirrored ? 100 - placement.x : placement.x,
  }))
}
