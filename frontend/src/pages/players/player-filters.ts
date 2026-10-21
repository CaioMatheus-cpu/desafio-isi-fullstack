import type { PlayerFilters, PlayerSort } from '../../api/players'
import type { Condition, Position } from '../../api/types'

// O estado dos campos de filtro da tela. Os campos de texto ficam como texto
// até serem enviados à API.
// Todos, só livres ou só jogadores que estão em algum clube.
export type Ownership = 'all' | 'free' | 'owned'

export interface FilterState {
  search: string
  position: Position | ''
  condition: Condition | ''
  ownership: Ownership
  clubId: string
  minAge: string
  maxAge: string
  minValue: string
  maxValue: string
  sort: PlayerSort
}

export const EMPTY_FILTERS: FilterState = {
  search: '',
  position: '',
  condition: '',
  ownership: 'all',
  clubId: '',
  minAge: '',
  maxAge: '',
  minValue: '',
  maxValue: '',
  sort: 'name',
}

export const SORT_OPTIONS: { value: PlayerSort; label: string }[] = [
  { value: 'name', label: 'Nome' },
  { value: 'value_desc', label: 'Maior valor de mercado' },
  { value: 'value_asc', label: 'Menor valor de mercado' },
  { value: 'age_desc', label: 'Maior idade' },
  { value: 'age_asc', label: 'Menor idade' },
  { value: 'position', label: 'Posição (GOL a ATA)' },
]

function toNumber(text: string): number | undefined {
  return text === '' ? undefined : Number(text)
}

// Converte os campos da tela nos parâmetros que a API entende.
export function toApiFilters(state: FilterState, page: number): PlayerFilters {
  return {
    search: state.search.trim(),
    position: state.position,
    condition: state.condition,
    free: state.ownership === 'all' ? undefined : state.ownership === 'free',
    club_id: toNumber(state.clubId),
    min_age: toNumber(state.minAge),
    max_age: toNumber(state.maxAge),
    min_value: state.minValue,
    max_value: state.maxValue,
    sort: state.sort,
    page,
  }
}
