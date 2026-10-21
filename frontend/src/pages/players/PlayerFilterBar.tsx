import { ArrowUpDown, Check, Coins, HeartPulse, Search, Shirt, Shield, User, X } from 'lucide-react'
import { CONDITIONS, POSITIONS } from '../../api/types'
import type { Club, Condition, Position } from '../../api/types'
import { FilterPopover } from '../../components/FilterPopover'
import { conditionLabel, formatMoney } from '../../lib/format'
import { SORT_OPTIONS } from './player-filters'
import type { FilterState } from './player-filters'

interface PlayerFilterBarProps {
  value: FilterState
  clubs: Club[]
  onChange: (patch: Partial<FilterState>) => void
  onClear: () => void
}

function OptionList<T extends string>({
  options,
  current,
  onPick,
  allLabel,
}: {
  options: { value: T; label: string }[]
  current: T | ''
  onPick: (value: T | '') => void
  allLabel: string
}) {
  const all: { value: T | ''; label: string }[] = [{ value: '', label: allLabel }, ...options]
  return (
    <div className="option-menu" role="radiogroup">
      {all.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={current === option.value}
          className="option-menu-item"
          onClick={() => onPick(option.value)}
        >
          <span className="option-check">
            {current === option.value && <Check size={14} aria-hidden="true" />}
          </span>
          {option.label}
        </button>
      ))}
    </div>
  )
}

function range(from: string, to: string, format: (value: string) => string): string | undefined {
  if (from && to) {
    return `${format(from)} a ${format(to)}`
  }
  if (from) {
    return `a partir de ${format(from)}`
  }
  if (to) {
    return `até ${format(to)}`
  }
  return undefined
}

const asMoney = (value: string) => formatMoney(Number(value))
const asIs = (value: string) => value

interface Chip {
  key: string
  text: string
  clear: Partial<FilterState>
}

// Busca e filtros combináveis da lista de jogadores. Cada filtro abre um painel;
// o que está ativo aparece em chips que podem ser removidos um a um.
export function PlayerFilterBar({ value, clubs, onChange, onClear }: PlayerFilterBarProps) {
  const clubName = clubs.find((club) => String(club.id) === value.clubId)?.name
  const ageSummary = range(value.minAge, value.maxAge, asIs)
  const valueSummary = range(value.minValue, value.maxValue, asMoney)

  const chips: Chip[] = []
  if (value.search.trim()) {
    chips.push({ key: 'search', text: `Busca: ${value.search.trim()}`, clear: { search: '' } })
  }
  if (value.position) {
    chips.push({ key: 'position', text: `Posição: ${value.position}`, clear: { position: '' } })
  }
  if (value.condition) {
    chips.push({
      key: 'condition',
      text: `Condição: ${conditionLabel(value.condition)}`,
      clear: { condition: '' },
    })
  }
  if (value.clubId && clubName) {
    chips.push({ key: 'club', text: `Clube: ${clubName}`, clear: { clubId: '' } })
  }
  if (ageSummary) {
    chips.push({ key: 'age', text: `Idade: ${ageSummary}`, clear: { minAge: '', maxAge: '' } })
  }
  if (valueSummary) {
    chips.push({
      key: 'value',
      text: `Valor de mercado: ${valueSummary}`,
      clear: { minValue: '', maxValue: '' },
    })
  }
  const onlySearch = chips.length === 1 && chips[0]?.key === 'search'

  return (
    <form className="filter-bar" onSubmit={(event) => event.preventDefault()} aria-label="Filtros">
      <div className="filter-row">
        <div className="search-field">
          <Search size={16} aria-hidden="true" />
          <input
            id="f-search"
            type="search"
            aria-label="Buscar por nome"
            value={value.search}
            placeholder="Buscar por nome"
            onChange={(event) => onChange({ search: event.target.value })}
          />
        </div>

        <FilterPopover
          icon={<Shirt size={16} aria-hidden="true" />}
          label="Posição"
          summary={value.position || undefined}
        >
          <OptionList<Position>
            allLabel="Todas"
            options={POSITIONS.map((position) => ({ value: position, label: position }))}
            current={value.position}
            onPick={(position) => onChange({ position })}
          />
        </FilterPopover>

        <FilterPopover
          icon={<HeartPulse size={16} aria-hidden="true" />}
          label="Condição"
          summary={value.condition ? conditionLabel(value.condition) : undefined}
        >
          <OptionList<Condition>
            allLabel="Todas"
            options={CONDITIONS.map((condition) => ({
              value: condition,
              label: conditionLabel(condition),
            }))}
            current={value.condition}
            onPick={(condition) => onChange({ condition })}
          />
        </FilterPopover>

        <FilterPopover
          icon={<Shield size={16} aria-hidden="true" />}
          label="Clube"
          summary={clubName}
          disabled={value.ownership === 'free'}
          disabledReason="“Livres” não combina com o filtro por clube."
        >
          <OptionList<string>
            allLabel="Todos"
            options={clubs.map((club) => ({
              value: String(club.id),
              label: `${club.name} (${club.acronym})`,
            }))}
            current={value.clubId}
            onPick={(clubId) => onChange({ clubId })}
          />
        </FilterPopover>

        <FilterPopover
          icon={<User size={16} aria-hidden="true" />}
          label="Idade"
          summary={ageSummary}
        >
          <div className="range-fields">
            <label htmlFor="f-min-age">Idade (de)</label>
            <input
              id="f-min-age"
              type="number"
              min={16}
              max={45}
              value={value.minAge}
              onChange={(event) => onChange({ minAge: event.target.value })}
            />
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
        </FilterPopover>

        <FilterPopover
          icon={<Coins size={16} aria-hidden="true" />}
          label="Valor de mercado"
          summary={valueSummary}
        >
          <div className="range-fields">
            <label htmlFor="f-min-value">Valor de mercado (de)</label>
            <input
              id="f-min-value"
              type="number"
              min={0}
              step="0.01"
              value={value.minValue}
              onChange={(event) => onChange({ minValue: event.target.value })}
            />
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
        </FilterPopover>
      </div>

      {chips.length > 0 && (
        <div className="chip-line">
          <span className="muted">
            {onlySearch ? 'Resultados para a busca:' : 'Filtros ativos:'}
          </span>
          {chips.map((chip) => (
            <span key={chip.key} className="filter-chip">
              {chip.text}
              <button
                type="button"
                aria-label={`Remover filtro: ${chip.text}`}
                onClick={() => onChange(chip.clear)}
              >
                <X size={12} aria-hidden="true" />
              </button>
            </span>
          ))}
          <button type="button" className="link-button" onClick={onClear}>
            Limpar filtros
          </button>
        </div>
      )}
    </form>
  )
}

// Ordenação da lista: o rótulo "Ordenar:" fica fora do menu, como no Figma.
export function SortSelect({
  value,
  onChange,
}: {
  value: FilterState['sort']
  onChange: (sort: FilterState['sort']) => void
}) {
  return (
    <label className="select-inline">
      <ArrowUpDown size={16} aria-hidden="true" />
      <span>Ordenar:</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as FilterState['sort'])}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
