import { ArrowUpDown, ChevronRight, Plus, Shield } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { listClubs } from '../../api/clubs'
import type { ClubSort } from '../../api/clubs'
import type { Club } from '../../api/types'
import { Button } from '../../components/Button'
import { DataTable } from '../../components/DataTable'
import type { Column } from '../../components/DataTable'
import { PageHeader } from '../../components/PageHeader'
import { useRequest } from '../../hooks/useRequest'
import { formatMoney } from '../../lib/format'
import { NewClubModal } from './NewClubModal'

// A liga aceita no máximo 20 clubes (RN12); a API é quem recusa o 21º.
const CLUB_LIMIT = 20

const SORT_OPTIONS: { value: ClubSort; label: string }[] = [
  { value: 'name', label: 'Nome' },
  { value: 'net_worth_desc', label: 'Patrimônio (maior para o menor)' },
  { value: 'net_worth_asc', label: 'Patrimônio (menor para o maior)' },
]

const COLUMNS: Column<Club>[] = [
  {
    header: 'Clube',
    render: (club) => (
      <span className="club-cell">
        <span className="club-badge-xs" aria-hidden="true">
          {club.acronym}
        </span>
        <Link className="link-plain" to={`/clubes/${club.id}`}>
          {club.name}
        </Link>
      </span>
    ),
  },
  {
    header: 'Sigla',
    render: (club) => <span className="badge badge-outline">{club.acronym}</span>,
  },
  { header: 'Caixa', numeric: true, render: (club) => formatMoney(club.cash) },
  { header: 'Valor do elenco', numeric: true, render: (club) => formatMoney(club.squad_value) },
  {
    header: 'Patrimônio',
    numeric: true,
    render: (club) => <strong>{formatMoney(club.net_worth)}</strong>,
  },
  {
    header: 'Ações',
    render: (club) => (
      <Link className="link-strong" to={`/clubes/${club.id}`}>
        Ver clube <ChevronRight size={14} aria-hidden="true" />
      </Link>
    ),
  },
]

export function ClubsPage() {
  const [sort, setSort] = useState<ClubSort>('name')
  const [creating, setCreating] = useState(false)
  const clubs = useRequest(() => listClubs(sort), `clubs-${sort}`)
  const total = clubs.data?.length

  return (
    <section>
      <PageHeader
        icon={Shield}
        title="Clubes"
        subtitle="Cada clube começa com 300,00 em caixa e sem jogadores. A liga aceita no máximo 20 clubes."
        action={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={16} aria-hidden="true" /> Novo clube
          </Button>
        }
      />

      <section className="card">
        <header className="card-head card-head-center">
          <p className="count-line">
            <strong>
              {total ?? '–'} {total === 1 ? 'clube' : 'clubes'}
            </strong>
            <span className="badge badge-muted">
              {total ?? '–'} de {CLUB_LIMIT}
            </span>
          </p>
          <label className="select-inline">
            <ArrowUpDown size={16} aria-hidden="true" />
            <span>Ordenar:</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as ClubSort)}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </header>

        <DataTable
          caption="Lista de clubes"
          columns={COLUMNS}
          rows={clubs.data}
          rowKey={(club) => club.id}
          loading={clubs.loading}
          error={clubs.error}
          onRetry={clubs.reload}
          errorTitle="Não foi possível carregar os clubes"
          empty={{
            icon: <Shield size={20} aria-hidden="true" />,
            title: 'Nenhum clube cadastrado',
            description: 'Crie o primeiro clube para começar.',
            action: (
              <Button onClick={() => setCreating(true)}>
                <Plus size={16} aria-hidden="true" /> Novo clube
              </Button>
            ),
          }}
        />
      </section>

      {creating && <NewClubModal onClose={() => setCreating(false)} />}
    </section>
  )
}
