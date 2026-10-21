import { request } from './client'
import type { Formation, Lineup } from './types'

export function getLineup(clubId: number): Promise<Lineup> {
  return request<Lineup>(`/clubs/${clubId}/lineup`)
}

export function saveLineup(
  clubId: number,
  formation: Formation,
  playerIds: number[],
): Promise<Lineup> {
  return request<Lineup>(`/clubs/${clubId}/lineup`, {
    method: 'PUT',
    body: { formation, player_ids: playerIds },
  })
}
