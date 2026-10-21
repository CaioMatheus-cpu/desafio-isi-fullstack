import { download, request } from './client'
import type { TransactionType, TransactionsPage } from './types'

// Os filtros do histórico, os mesmos da tela e da exportação em CSV.
export interface TransactionFilters {
  types: TransactionType[]
  playerId?: number
}

function toQuery(filters: TransactionFilters) {
  return {
    type: filters.types.length > 0 ? filters.types.join(',') : undefined,
    player_id: filters.playerId,
  }
}

export function listTransactions(clubId: number, filters: TransactionFilters) {
  return request<TransactionsPage>(`/clubs/${clubId}/transactions`, { query: toQuery(filters) })
}

export function exportTransactions(clubId: number, filters: TransactionFilters) {
  return download(`/clubs/${clubId}/transactions/export`, toQuery(filters))
}
