import { request } from './client'
import type { PurchaseResult, SaleResult } from './types'

export interface PurchaseRequest {
  club_id: number
  // Horário de Brasília no formato AAAA-MM-DDTHH:MM-03:00.
  loyalty_until: string
}

export function buyPlayer(playerId: number, purchase: PurchaseRequest): Promise<PurchaseResult> {
  return request<PurchaseResult>(`/players/${playerId}/buy`, { method: 'POST', body: purchase })
}

export function sellPlayer(playerId: number): Promise<SaleResult> {
  return request<SaleResult>(`/players/${playerId}/sell`, { method: 'POST' })
}
