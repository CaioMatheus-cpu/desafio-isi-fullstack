// Tipos das respostas da API. Os nomes dos campos são os do enunciado
// (snake_case), exatamente como a API devolve.

export const POSITIONS = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'] as const
export type Position = (typeof POSITIONS)[number]

export const CONDITIONS = ['APTO', 'MAL_CONDICIONADO', 'DOENTE'] as const
export type Condition = (typeof CONDITIONS)[number]

export interface Player {
  id: number
  name: string
  position: Position
  agility: number
  age: number
  condition: Condition
  base_value: number
  market_value: number
  pace: number
  shooting: number
  passing: number
  dribbling: number
  defending: number
  physical: number
  potential: number
  overall: number
  club_id: number | null
}

export interface PageMeta {
  page: number
  limit: number
  total_items: number
  total_pages: number
}

export interface Page<T> {
  data: T[]
  meta: PageMeta
}

export interface Club {
  id: number
  name: string
  acronym: string
  cash: number
  squad_value: number
  net_worth: number
}

// ---------- contrato e elenco ----------

export interface Contract {
  purchase_value: number
  loyalty_until: string
  remaining_days: number
  penalty_rate: number
}

export interface SquadPlayer extends Player {
  contract: Contract | null
}

export interface ClubDetail extends Club {
  players: SquadPlayer[]
}

// ---------- compra e venda ----------

export interface PurchaseResult {
  id: number
  club_id: number
  player_id: number
  player_name: string
  value: number
  fee: number
  cash_change: number
  created_at: string
  contract: { purchase_value: number; loyalty_until: string; status: string }
  club_cash: number
}

export interface SaleResult {
  id: number
  club_id: number
  player_id: number
  player_name: string
  value: number
  fee: number
  penalty: number
  profit: number
  cash_change: number
  created_at: string
  purchase_value: number
  remaining_days: number
  penalty_rate: number
  contract_status: string
  club_cash: number
}

// ---------- histórico de transações ----------

export const TRANSACTION_TYPES = ['COMPRA', 'VENDA'] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

export interface Transaction {
  id: number
  club_id: number
  player_id: number
  player_name: string
  type: TransactionType
  value: number
  fee: number
  penalty: number
  profit: number | null
  cash_change: number
  created_at: string
}

export interface TransactionSummary {
  total_spent: number
  total_received: number
  total_fees: number
  total_penalties: number
  total_profit: number
}

export interface TransactionsPage {
  data: Transaction[]
  summary: TransactionSummary
}

// ---------- escalação ----------

export const FORMATIONS = ['3-1', '2-2', '2-1-1', '1-2-1'] as const
export type Formation = (typeof FORMATIONS)[number]

export interface Lineup {
  club_id: number
  formation: Formation | null
  complete: boolean
  players: Player[]
}

// ---------- partidas e classificação ----------

export interface DuelSide {
  player_id: number
  player_name: string
  position: Position
  condition: Condition
  attribute: string
  value: number
}

export interface Duel {
  order: number
  attacking_club_id: number
  attacker: DuelSide
  defender: DuelSide
  goal: boolean
}

export interface MatchSide {
  club_id: number
  club_name: string
  formation: string
  goals: number
}

export interface MatchSummary {
  id: number
  played_at: string
  home: MatchSide
  away: MatchSide
  result: 'MANDANTE' | 'VISITANTE' | 'EMPATE'
}

export interface Match extends MatchSummary {
  duels: Duel[]
}

export interface Standing {
  position: number
  club_id: number
  club_name: string
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}
