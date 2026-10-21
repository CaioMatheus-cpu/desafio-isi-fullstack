import { request } from './client'
import type { Club, ClubDetail } from './types'

export type ClubSort = 'name' | 'net_worth_asc' | 'net_worth_desc'

export interface NewClub {
  name: string
  acronym: string
}

export function listClubs(sort: ClubSort = 'name'): Promise<Club[]> {
  return request<Club[]>('/clubs', { query: { sort } })
}

export function getClub(id: number): Promise<ClubDetail> {
  return request<ClubDetail>(`/clubs/${id}`)
}

export function createClub(club: NewClub): Promise<Club> {
  return request<Club>('/clubs', { method: 'POST', body: club })
}
