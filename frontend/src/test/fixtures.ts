import type { Club, Duel, Match, Player, PurchaseResult } from '../api/types'

export function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 1,
    name: 'Eduardo Paiva',
    position: 'MEI',
    agility: 68,
    age: 26,
    condition: 'APTO',
    base_value: 46,
    market_value: 46,
    pace: 70,
    shooting: 72,
    passing: 84,
    dribbling: 80,
    defending: 52,
    physical: 63,
    potential: 86,
    overall: 76,
    club_id: null,
    ...overrides,
  }
}

export function makeClub(overrides: Partial<Club> = {}): Club {
  return {
    id: 1,
    name: 'Águias FC',
    acronym: 'AGU',
    cash: 300,
    squad_value: 0,
    net_worth: 300,
    ...overrides,
  }
}

export function makePurchase(overrides: Partial<PurchaseResult> = {}): PurchaseResult {
  return {
    id: 1,
    club_id: 1,
    player_id: 1,
    player_name: 'Eduardo Paiva',
    value: 46,
    fee: 2.3,
    cash_change: -48.3,
    created_at: '2026-11-12T15:00:00-03:00',
    contract: {
      purchase_value: 46,
      loyalty_until: '2027-11-12T15:00:00-03:00',
      status: 'ATIVO',
    },
    club_cash: 251.7,
    ...overrides,
  }
}

function side(
  id: number,
  name: string,
  position: Player['position'],
  attribute: string,
  value: number,
  condition: Player['condition'] = 'APTO',
): Duel['attacker'] {
  return { player_id: id, player_name: name, position, condition, attribute, value }
}

// Uma partida completa, com os 6 duelos que a API devolve. O mandante (clube 1, 2-1-1)
// ataca com o 4º, o 3º e o 2º jogador de linha; o visitante (clube 2) idem.
export function makeMatch(): Match {
  return {
    id: 7,
    played_at: '2026-11-11T20:00:00-03:00',
    home: { club_id: 1, club_name: 'Delta FC', formation: '2-1-1', goals: 2 },
    away: { club_id: 2, club_name: 'Águias FC', formation: '2-1-1', goals: 1 },
    result: 'MANDANTE',
    duels: [
      {
        order: 1,
        attacking_club_id: 1,
        attacker: side(1, 'Gabriel Antunes', 'ATA', 'shooting', 81),
        defender: side(10, 'Bruno Tavares', 'GOL', 'defending', 77),
        goal: true,
      },
      {
        order: 2,
        attacking_club_id: 1,
        attacker: side(2, 'Meia Lua', 'MEI', 'passing', 82),
        defender: side(11, 'Felipe Moura', 'ZAG', 'defending', 83),
        goal: false,
      },
      {
        order: 3,
        attacking_club_id: 1,
        attacker: side(3, 'Kauã Ribeiro', 'LAT', 'dribbling', 75),
        defender: side(12, 'Diego Ramos', 'LAT', 'defending', 56, 'MAL_CONDICIONADO'),
        goal: true,
      },
      {
        order: 4,
        attacking_club_id: 2,
        attacker: side(13, 'João Silva', 'ATA', 'shooting', 79),
        defender: side(4, 'André Lacerda', 'GOL', 'defending', 74),
        goal: true,
      },
      {
        order: 5,
        attacking_club_id: 2,
        attacker: side(14, 'Sávio Lima', 'MEI', 'passing', 60),
        defender: side(5, 'Danilo Freitas', 'ZAG', 'defending', 67),
        goal: false,
      },
      {
        order: 6,
        attacking_club_id: 2,
        attacker: side(12, 'Diego Ramos', 'LAT', 'dribbling', 63, 'MAL_CONDICIONADO'),
        defender: side(3, 'Kauã Ribeiro', 'LAT', 'defending', 63),
        goal: false,
      },
    ],
  }
}
