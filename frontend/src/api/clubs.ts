import { request } from './client'
import type { Club } from './types'

export type ClubSort = 'name' | 'net_worth_asc' | 'net_worth_desc'

export function listClubs(sort: ClubSort = 'name'): Promise<Club[]> {
  return request<Club[]>('/clubs', { query: { sort } })
}
