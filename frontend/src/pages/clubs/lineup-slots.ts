import type { Formation, Player, Position } from '../../api/types'

// Uma vaga da escalação e as posições que podem ocupá-la.
export interface Slot {
  title: string
  // Posições aceitas, escritas como no Figma ("ZAG ou LAT").
  sub: string
  positions: Position[]
}

const goalkeeper: Slot = { title: 'Goleiro', sub: 'GOL', positions: ['GOL'] }
const defender: Slot = { title: 'Defesa', sub: 'ZAG ou LAT', positions: ['ZAG', 'LAT'] }
const midfielder: Slot = { title: 'Meio', sub: 'MEI', positions: ['MEI'] }
const attacker: Slot = { title: 'Ataque', sub: 'ATA', positions: ['ATA'] }

// As 5 vagas de cada formação: o goleiro e os 4 jogadores de linha, contados
// por setor, de trás para frente (RN19).
export const FORMATION_SLOTS: Record<Formation, Slot[]> = {
  '3-1': [goalkeeper, defender, defender, defender, attacker],
  '2-2': [goalkeeper, defender, defender, attacker, attacker],
  '2-1-1': [goalkeeper, defender, defender, midfielder, attacker],
  '1-2-1': [goalkeeper, defender, midfielder, midfielder, attacker],
}

export const FORMATION_HINTS: Record<Formation, string> = {
  '3-1': 'Defesa 3, ataque 1',
  '2-2': 'Defesa 2, ataque 2',
  '2-1-1': 'Defesa 2, meio 1, ataque 1',
  '1-2-1': 'Defesa 1, meio 2, ataque 1',
}

export const SLOT_COUNT = 5

// Distribui os titulares atuais pelas vagas da formação, para o formulário já
// abrir com a escalação salva. Cada jogador entra na primeira vaga compatível.
export function assignStarters(formation: Formation | null, starters: Player[]): string[] {
  const empty = Array<string>(SLOT_COUNT).fill('')
  if (!formation) {
    return empty
  }
  const remaining = [...starters]
  return FORMATION_SLOTS[formation].map((slot) => {
    const index = remaining.findIndex((player) => slot.positions.includes(player.position))
    if (index === -1) {
      return ''
    }
    return String(remaining.splice(index, 1)[0].id)
  })
}

// Quais atributos o titular usa na partida, pela vaga (RN20): o 1º jogador de
// linha só defende; o 2º ataca e defende; o 3º e o 4º só atacam; o goleiro só defende.
export function usedAttributes(
  slotIndex: number,
  player: Pick<Player, 'position' | 'pace' | 'shooting' | 'passing' | 'dribbling' | 'defending'>,
): { label: string; value: number }[] {
  const defends = slotIndex <= 2
  const attacks = slotIndex >= 2
  const used: { label: string; value: number }[] = []
  if (attacks && player.position !== 'GOL') {
    if (player.position === 'ATA') {
      used.push({ label: 'Finalização', value: player.shooting })
    } else if (player.position === 'MEI') {
      used.push({ label: 'Passe', value: player.passing })
    } else {
      used.push({ label: 'Drible', value: player.dribbling })
    }
  }
  if (defends) {
    used.push({ label: 'Defesa', value: player.defending })
  }
  return used
}
