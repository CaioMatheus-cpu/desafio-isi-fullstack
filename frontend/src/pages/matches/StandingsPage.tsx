import { ListOrdered, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listClubs } from '../../api/clubs'
import { listMatches, listStandings } from '../../api/matches'
import type { Standing } from '../../api/types'
import { Button } from '../../components/Button'
import { DataTable } from '../../components/DataTable'
import type { Column } from '../../components/DataTable'
import { PageHeader } from '../../components/PageHeader'
import { useRequest } from '../../hooks/useRequest'
import { formatDateParts } from '../../lib/format'
import { NewMatchModal } from './NewMatchModal'

const TIE_BREAKERS = [
  'Mais pontos',
  'Maior saldo de gols',
  'Mais gols marcados',
  'Nome do clube, de A a Z',
]

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value)
}

// A classificação na ordem em que a API devolve (pontos, saldo, gols marcados e
// nome). A tela não ordena nem soma nada.
export function StandingsPage() {
  const [creating, setCreating] = useState(false)
  const standings = useRequest(() => listStandings(), 'standings')
  const clubs = useRequest(() => listClubs(), 'clubs')
  const matches = useRequest(() => listMatches(), 'matches-all')

  const acronym = useMemo(
    () => new Map((clubs.data ?? []).map((club) => [club.id, club.acronym])),
    [clubs.data],
  )

  const columns: Column<Standing>[] = [
    {
      header: '#',
      render: (row) => (
        <span className={`position-chip${row.position === 1 ? ' position-first' : ''}`}>
          {row.position}
        </span>
      ),
    },
    {
      header: 'Clube',
      render: (row) => (
        <span className="club-cell">
          <span className="badge badge-muted">{acronym.get(row.club_id) ?? '—'}</span>
          <Link to={`/clubes/${row.club_id}`}>{row.club_name}</Link>
        </span>
      ),
    },
    { header: 'J', numeric: true, render: (row) => row.played },
    { header: 'V', numeric: true, render: (row) => row.wins },
    { header: 'E', numeric: true, render: (row) => row.draws },
    { header: 'D', numeric: true, render: (row) => row.losses },
    { header: 'GP', numeric: true, render: (row) => row.goals_for },
    { header: 'GC', numeric: true, render: (row) => row.goals_against },
    { header: 'SG', numeric: true, render: (row) => signed(row.goal_difference) },
    { header: 'Pts', numeric: true, render: (row) => <strong>{row.points}</strong> },
  ]

  const latest = matches.data?.slice(0, 2) ?? []

  return (
    <section>
      <PageHeader
        icon={ListOrdered}
        title="Classificação"
        subtitle="Todos os clubes, com 3 pontos por vitória e 1 por empate."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} aria-hidden="true" /> Nova partida
          </Button>
        }
      />

      <div className="standings-layout">
        <div>
          <div className="card">
            <DataTable
              caption="Classificação"
              columns={columns}
              rows={standings.data}
              rowKey={(row) => row.club_id}
              loading={standings.loading}
              error={standings.error}
              errorTitle="Não foi possível carregar a classificação"
              onRetry={standings.reload}
              empty={{
                title: 'Nenhum clube cadastrado',
                description:
                  'A classificação mostra todos os clubes, mesmo os que ainda não jogaram.',
              }}
            />
            {standings.data && standings.data.length > 0 && (
              <p className="card-foot muted">
                J: jogos · V: vitórias · E: empates · D: derrotas · GP: gols marcados · GC: gols
                sofridos · SG: saldo de gols · Pts: pontos
              </p>
            )}
          </div>
        </div>

        <aside className="side-cards">
          <section className="card">
            <header className="card-head">
              <div>
                <h2>Últimas partidas</h2>
                <p className="muted">Da mais recente para a mais antiga.</p>
              </div>
            </header>
            <div className="card-body">
              {latest.length === 0 && <p className="muted">Nenhuma partida jogada.</p>}
              {latest.map((match) => (
                <Link key={match.id} to={`/partidas/${match.id}`} className="latest-match">
                  <span className="muted">
                    {formatDateParts(match.played_at).date}, {formatDateParts(match.played_at).time}
                  </span>
                  <span className="latest-line">
                    <strong>{match.home.club_name}</strong>
                    <span className="score-chip">
                      {match.home.goals} × {match.away.goals}
                    </span>
                    {match.away.club_name}
                  </span>
                </Link>
              ))}
              {latest.length > 0 && (
                <Link className="link-blue" to="/partidas">
                  Ver todas as partidas →
                </Link>
              )}
            </div>
          </section>

          <section className="card">
            <header className="card-head">
              <div>
                <h2>Ordem da tabela</h2>
                <p className="muted">Critérios de classificação, nesta ordem.</p>
              </div>
            </header>
            <ol className="tiebreakers">
              {TIE_BREAKERS.map((text, index) => (
                <li key={text}>
                  <span className="order-chip">{index + 1}</span> {text}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>

      {creating && <NewMatchModal onClose={() => setCreating(false)} />}
    </section>
  )
}
