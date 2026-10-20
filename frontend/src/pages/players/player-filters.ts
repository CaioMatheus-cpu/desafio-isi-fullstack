import type { PlayerFilters, PlayerSort } from '../../api/players'
import type { Condition, Position } from '../../api/types'

// O estado dos campos de filtro da tela. Os campos de texto ficam como texto
// até serem enviados à API.
export interface FilterState {
  search: string
  position: Position | ''
  condition: Condition | ''
  free: boolean
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
  free: false,
  clubId: '',
  minAge: '',
  maxAge: '',
  minValue: '',
  maxValue: '',
  sort: 'name',
}

export const SORT_OPTIONS: { value: PlayerSort; label: string }[] = [
  { value: 'name', label: 'Nome (A a Z)' },
  { value: 'value_desc', label: 'Valor de mercado (maior primeiro)' },
  { value: 'value_asc', label: 'Valor de mercado (menor primeiro)' },
  { value: 'age_desc', label: 'Idade (maior primeiro)' },
  { value: 'age_asc', label: 'Idade (menor primeiro)' },
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
    free: state.free,
    club_id: toNumber(state.clubId),
    min_age: toNumber(state.minAge),
    max_age: toNumber(state.maxAge),
    min_value: state.minValue,
    max_value: state.maxValue,
    sort: state.sort,
    page,
  }
}
