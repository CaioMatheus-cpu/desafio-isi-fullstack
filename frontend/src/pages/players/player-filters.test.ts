import { describe, expect, it } from 'vitest'
import { EMPTY_FILTERS, toApiFilters } from './player-filters'

describe('toApiFilters', () => {
  it('sem filtros, não manda nada além da ordenação e da página', () => {
    const filters = toApiFilters(EMPTY_FILTERS, 1)
    expect(filters.free).toBeUndefined()
    expect(filters.club_id).toBeUndefined()
    expect(filters.sort).toBe('name')
    expect(filters.page).toBe(1)
  })

  it('a aba "Livres" manda free=true e a aba "Em clubes" manda free=false', () => {
    expect(toApiFilters({ ...EMPTY_FILTERS, ownership: 'free' }, 1).free).toBe(true)
    expect(toApiFilters({ ...EMPTY_FILTERS, ownership: 'owned' }, 1).free).toBe(false)
  })

  it('converte os campos de texto em números e tira os espaços da busca', () => {
    const filters = toApiFilters(
      { ...EMPTY_FILTERS, search: '  joao  ', clubId: '3', minAge: '18', maxAge: '30' },
      2,
    )
    expect(filters.search).toBe('joao')
    expect(filters.club_id).toBe(3)
    expect(filters.min_age).toBe(18)
    expect(filters.max_age).toBe(30)
    expect(filters.page).toBe(2)
  })
})
