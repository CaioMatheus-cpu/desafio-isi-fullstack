import { CONDITIONS, POSITIONS } from '../../api/types'
import type { Club, Condition, Position } from '../../api/types'
import { Button } from '../../components/Button'
import { conditionLabel } from '../../lib/format'
import { SORT_OPTIONS } from './player-filters'
import type { FilterState } from './player-filters'

interface PlayerFilterBarProps {
  value: FilterState
  clubs: Club[]
  onChange: (patch: Partial<FilterState>) => void
  onClear: () => void
}

// Busca, filtros combináveis e ordenação da lista de jogadores.
export function PlayerFilterBar({ value, clubs, onChange, onClear }: PlayerFilterBarProps) {
  return (
    <form className="filters" onSubmit={(event) => event.preventDefault()} aria-label="Filtros">
      <div className="field">
        <label htmlFor="f-search">Buscar pelo nome</label>
        <input
          id="f-search"
          type="search"
          value={value.search}
          placeholder="Ex.: João"
          onChange={(event) => onChange({ search: event.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="f-position">Posição</label>
        <select
          id="f-position"
          value={value.position}
          onChange={(event) => onChange({ position: event.target.value as Position | '' })}
        >
          <option value="">Todas</option>
          {POSITIONS.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-condition">Condição</label>
        <select
          id="f-condition"
          value={value.condition}
          onChange={(event) => onChange({ condition: event.target.value as Condition | '' })}
        >
          <option value="">Todas</option>
          {CONDITIONS.map((condition) => (
            <option key={condition} value={condition}>
              {conditionLabel(condition)}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-club">Clube</label>
        <select
          id="f-club"
          value={value.clubId}
          disabled={value.free}
          title={value.free ? 'Desmarque "Só livres" para filtrar por clube' : undefined}
          onChange={(event) => onChange({ clubId: event.target.value })}
        >
          <option value="">Todos</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name} ({club.acronym})
            </option>
          ))}
        </select>
      </div>

      <div className="field field-check">
        <label htmlFor="f-free">
          <input
            id="f-free"
            type="checkbox"
            checked={value.free}
            onChange={(event) =>
              onChange({ free: event.target.checked, clubId: event.target.checked ? '' : value.clubId })
            }
          />
          Só livres
        </label>
      </div>

      <div className="field">
        <label htmlFor="f-min-age">Idade (de)</label>
        <input
          id="f-min-age"
          type="number"
          min={16}
          max={45}
          value={value.minAge}
          onChange={(event) => onChange({ minAge: event.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="f-max-age">Idade (até)</label>
        <input
          id="f-max-age"
          type="number"
          min={16}
          max={45}
          value={value.maxAge}
          onChange={(event) => onChange({ maxAge: event.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="f-min-value">Valor de mercado (de)</label>
        <input
          id="f-min-value"
          type="number"
          min={0}
          step="0.01"
          value={value.minValue}
          onChange={(event) => onChange({ minValue: event.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="f-max-value">Valor de mercado (até)</label>
        <input
          id="f-max-value"
          type="number"
          min={0}
          step="0.01"
          value={value.maxValue}
          onChange={(event) => onChange({ maxValue: event.target.value })}
        />
      </div>

      <div className="field">
        <label htmlFor="f-sort">Ordenar por</label>
        <select
          id="f-sort"
          value={value.sort}
          onChange={(event) => onChange({ sort: event.target.value as FilterState['sort'] })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field field-action">
        <Button onClick={onClear}>Limpar filtros</Button>
      </div>
    </form>
  )
}
