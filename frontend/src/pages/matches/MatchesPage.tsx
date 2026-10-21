import { ChevronRight, Plus, Shield, Swords } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listClubs } from '../../api/clubs'
import { listMatches } from '../../api/matches'
import type { MatchSummary } from '../../api/types'
import { Button } from '../../components/Button'
import { DataTable } from '../../components/DataTable'
import type { Column } from '../../components/DataTable'
import { PageHeader } from '../../components/PageHeader'
import { useRequest } from '../../hooks/useRequest'
import { formatDateParts } from '../../lib/format'
import { RESULT_LABELS } from '../../lib/match-view'
import { NewMatchModal } from './NewMatchModal'

// Data e hora com a hora em cinza, como no Figma.
function When({ value }: { value: string }) {
  const { date, time } = formatDateParts(value)
  return (
    <span>
      {date} <span className="muted">{time}</span>
    </span>
  )
}

export function MatchesPage() {
  const [clubFilter, setClubFilter] = useState('')
  const [creating, setCreating] = useState(false)
  const clubs = useRequest(() => listClubs(), 'clubs')
  const all = useRequest(() => listMatches(), 'matches-all')
  const history = useRequest(
    () => listMatches(clubFilter === '' ? undefined : Number(clubFilter)),
    `matches-${clubFilter}`,
  )

  const acronym = useMemo(
    () => new Map((clubs.data ?? []).map((club) => [club.id, club.acronym])),
    [clubs.data],
  )
  const last = all.data?.[0]

  const columns: Column<MatchSummary>[] = [
    { header: 'Data e hora', render: (match) => <When value={match.played_at} /> },
    {
      header: 'Mandante',
      render: (match) => (
        <span className={`team-cell${match.result === 'MANDANTE' ? ' team-winner' : ''}`}>
          {match.home.club_name}
          <span className="badge badge-muted">{acronym.get(match.home.club_id) ?? '—'}</span>
        </span>
      ),
    },
    {
      header: 'Placar',
      render: (match) => (
        <span className="score-chip">
          {match.home.goals} × {match.away.goals}
        </span>
      ),
    },
    {
      header: 'Visitante',
      render: (match) => (
        <span className={`team-cell${match.result === 'VISITANTE' ? ' team-winner' : ''}`}>
          <span className="badge badge-muted">{acronym.get(match.away.club_id) ?? '—'}</span>
          {match.away.club_name}
        </span>
      ),
    },
    {
      header: 'Resultado',
      render: (match) => <span className="badge badge-outline">{RESULT_LABELS[match.result]}</span>,
    },
    {
      header: 'Duelos',
      render: (match) => (
        <Link className="link-strong" to={`/partidas/${match.id}`}>
          Ver duelos <ChevronRight size={14} aria-hidden="true" />
        </Link>
      ),
    },
  ]

  const newMatchButton = (
    <Button variant="primary" onClick={() => setCreating(true)}>
      <Plus size={16} aria-hidden="true" /> Nova partida
    </Button>
  )

  return (
    <section>
      <PageHeader
        icon={Swords}
        title="Partidas"
        subtitle="Jogue partidas entre clubes com os 5 titulares escalados e acompanhe o histórico."
        action={newMatchButton}
      />

      {last && (
        <>
          <h2 className="eyebrow">Última partida</h2>
          <div className="last-match">
            <div className="last-team last-team-home">
              <div>
                <strong>{last.home.club_name}</strong>
                <span className="muted">Mandante</span>
              </div>
              <span className="club-badge-sm">{acronym.get(last.home.club_id)}</span>
            </div>
            <div className="last-score">
              <span className="score-big">
                {last.home.goals} × {last.away.goals}
              </span>
              <span className="muted">
                {formatDateParts(last.played_at).date}, {formatDateParts(last.played_at).time}
              </span>
              <span className="badge badge-outline">{RESULT_LABELS[last.result]}</span>
            </div>
            <div className="last-team">
              <span className="club-badge-sm">{acronym.get(last.away.club_id)}</span>
              <div>
                <strong>{last.away.club_name}</strong>
                <span className="muted">Visitante</span>
              </div>
            </div>
            <Link className="btn last-link" to={`/partidas/${last.id}`}>
              Ver duelos <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </>
      )}

      <section className="card">
        <header className="card-head">
          <div>
            <h2>Histórico de partidas</h2>
            <p className="muted">Da mais recente para a mais antiga.</p>
          </div>
          <label className="select-inline">
            <Shield size={16} aria-hidden="true" />
            <span>Clube:</span>
            <select value={clubFilter} onChange={(event) => setClubFilter(event.target.value)}>
              <option value="">todos</option>
              {(clubs.data ?? []).map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </label>
        </header>

        <DataTable
          caption="Histórico de partidas"
          columns={columns}
          rows={history.data}
          rowKey={(match) => match.id}
          loading={history.loading}
          error={history.error}
          errorTitle="Não foi possível carregar as partidas"
          onRetry={history.reload}
          empty={{
            title: 'Nenhuma partida jogada',
            description: 'Escale os titulares de dois clubes e jogue a primeira partida.',
            action: (
              <Button onClick={() => setCreating(true)}>
                <Plus size={16} aria-hidden="true" /> Nova partida
              </Button>
            ),
          }}
        />
        {history.data && history.data.length > 0 && (
          <p className="card-foot muted">
            {history.data.length} {history.data.length === 1 ? 'partida' : 'partidas'}
          </p>
        )}
      </section>

      {creating && <NewMatchModal onClose={() => setCreating(false)} />}
    </section>
  )
}
