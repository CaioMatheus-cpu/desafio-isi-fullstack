import { request } from './client'
import type { Match, MatchSummary, Standing } from './types'

export function playMatch(homeClubId: number, awayClubId: number): Promise<Match> {
  return request<Match>('/matches', {
    method: 'POST',
    body: { home_club_id: homeClubId, away_club_id: awayClubId },
  })
}

export function listMatches(clubId?: number): Promise<MatchSummary[]> {
  return request<MatchSummary[]>('/matches', { query: { club_id: clubId } })
}

export function getMatch(id: number): Promise<Match> {
  return request<Match>(`/matches/${id}`)
}

export function listStandings(): Promise<Standing[]> {
  return request<Standing[]>('/standings')
}
