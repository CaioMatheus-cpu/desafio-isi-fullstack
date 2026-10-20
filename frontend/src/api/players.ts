import { request } from './client'
import type { Condition, Page, Player, Position } from './types'

export const PLAYERS_PER_PAGE = 10

export type PlayerSort =
  | 'name'
  | 'value_asc'
  | 'value_desc'
  | 'age_asc'
  | 'age_desc'
  | 'position'

// Os filtros da listagem. Tudo é opcional: o que ficar vazio não filtra.
export interface PlayerFilters {
  search?: string
  position?: Position | ''
  condition?: Condition | ''
  free?: boolean
  club_id?: number
  min_age?: number
  max_age?: number
  min_value?: string
  max_value?: string
  sort: PlayerSort
  page: number
}

// Dados que o cadastro envia. O valor base e o overall NÃO vão: a API calcula.
export interface NewPlayer {
  name: string
  position: Position
  agility: number
  age: number
  pace: number
  shooting: number
  passing: number
  dribbling: number
  defending: number
  physical: number
  potential: number
}

export type PlayerEdit = Pick<NewPlayer, 'name' | 'position' | 'agility' | 'age'>

export function listPlayers(filters: PlayerFilters): Promise<Page<Player>> {
  return request<Page<Player>>('/players', {
    query: {
      ...filters,
      free: filters.free ? true : undefined,
      limit: PLAYERS_PER_PAGE,
    },
  })
}

export function createPlayer(player: NewPlayer): Promise<Player> {
  return request<Player>('/players', { method: 'POST', body: player })
}

export function updatePlayer(id: number, player: PlayerEdit): Promise<Player> {
  return request<Player>(`/players/${id}`, { method: 'PUT', body: player })
}

export function changeCondition(id: number, condition: Condition): Promise<Player> {
  return request<Player>(`/players/${id}/condition`, {
    method: 'PATCH',
    body: { condition },
  })
}

export function deletePlayer(id: number): Promise<void> {
  return request<void>(`/players/${id}`, { method: 'DELETE' })
}
