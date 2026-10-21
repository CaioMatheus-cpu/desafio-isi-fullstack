import { ArrowLeft, HeartPulse, SearchX, Volleyball } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { listClubs } from '../../api/clubs'
import { getMatch } from '../../api/matches'
import type { Duel, Match } from '../../api/types'
import { Avatar } from '../../components/Badges'
import { Button } from '../../components/Button'
import { Pitch } from '../../components/Pitch'
import { useRequest } from '../../hooks/useRequest'
import { formatDateParts } from '../../lib/format'
import {
  ATTRIBUTE_NAMES,
  RESULT_LABELS,
  attackIndexOf,
  attackerLine,
  buildTeams,
  defenderLine,
  lineLabel,
} from '../../lib/match-view'

function DuelRow({
  duel,
  match,
  clubName,
}: {
  duel: Duel
  match: Match
  clubName: (clubId: number, attacking: boolean) => string
}) {
  const index = attackIndexOf(match.duels, duel)
  const attackName = ATTRIBUTE_NAMES[duel.attacker.attribute]?.long ?? duel.attacker.attribute
  const defenseName = ATTRIBUTE_NAMES[duel.defender.attribute]?.long ?? duel.defender.attribute
  return (
    <tr>
      <td>
        <span className="order-chip">{duel.order}</span>
      </td>
      <td>
        <span className="person">
          <Avatar name={duel.attacker.player_name} />
          <span>
            <strong>{duel.attacker.player_name}</strong>
            <span className="person-sub">
              {lineLabel(duel.attacker.position, attackerLine(index))} ·{' '}
              {clubName(duel.attacking_club_id, true)}
            </span>
          </span>
        </span>
      </td>
      <td>
        <span className="muted">{attackName}</span> <strong>{duel.attacker.value}</strong>
      </td>
      <td>
        <span className="person">
          <Avatar name={duel.defender.player_name} />
          <span>
            <strong>{duel.defender.player_name}</strong>
            <span className="person-sub">
              {lineLabel(duel.defender.position, defenderLine(index))} ·{' '}
              {clubName(duel.attacking_club_id, false)}
            </span>
          </span>
        </span>
      </td>
      <td>
        <span className="muted">{defenseName}</span> <strong>{duel.defender.value}</strong>
      </td>
      <td>
        {duel.goal ? (
          <span className="badge badge-success">
            <Volleyball size={12} aria-hidden="true" /> Gol
          </span>
        ) : (
          <span className="badge badge-outline">Sem gol</span>
        )}
      </td>
    </tr>
  )
}

// A partida jogada: placar, o campo com os titulares e os 6 duelos. Tudo vem da
// API; as formações e os valores de cada duelo já estão gravados na partida.
export function MatchPage() {
  const { id } = useParams()
  const matchId = Number(id)
  const match = useRequest(() => getMatch(matchId), `match-${matchId}`)
  const clubs = useRequest(() => listClubs(), 'clubs')

  if (match.error) {
    const missing = match.error.toLowerCase().includes('não encontrad')
    return (
      <section>
        <div className="state-box state-empty">
          <span className="state-icon">
            <SearchX size={20} aria-hidden="true" />
          </span>
          <strong>
            {missing ? 'Partida não encontrada' : 'Não foi possível carregar a partida'}
          </strong>
          <p className="muted">{match.error}</p>
          {missing ? (
            <Link className="btn" to="/partidas">
              <ArrowLeft size={16} aria-hidden="true" /> Voltar para partidas
            </Link>
          ) : (
            <Button onClick={match.reload}>Tentar de novo</Button>
          )}
        </div>
      </section>
    )
  }

  const data = match.data
  if (!data) {
    return (
      <div className="state-box" role="status" aria-busy="true">
        <div className="skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="muted">Carregando...</p>
      </div>
    )
  }

  const acronym = new Map((clubs.data ?? []).map((club) => [club.id, club.acronym]))
  const [home, away] = buildTeams(data)
  const when = formatDateParts(data.played_at)

  function clubName(duelClubId: number, attacking: boolean): string {
    const attackingTeam = duelClubId === home.clubId ? home : away
    const defendingTeam = attackingTeam === home ? away : home
    return (attacking ? attackingTeam : defendingTeam).name
  }

  const homeDuels = data.duels.filter((duel) => duel.attacking_club_id === home.clubId)
  const awayDuels = data.duels.filter((duel) => duel.attacking_club_id === away.clubId)

  return (
    <section className="match-page">
      <Link className="back-link" to="/partidas">
        <ArrowLeft size={16} aria-hidden="true" /> Voltar para partidas
      </Link>

      <div className="card match-head">
        <div className="last-team last-team-home">
          <div>
            <strong>{home.name}</strong>
            <span className="muted">Mandante · {home.formation}</span>
          </div>
          <span className="club-badge-sm">{acronym.get(home.clubId)}</span>
        </div>
        <div className="last-score">
          <span className="score-big">
            {home.goals} × {away.goals}
          </span>
          <span className="muted">
            {when.date}, {when.time}
          </span>
          <span className="badge badge-outline">{RESULT_LABELS[data.result]}</span>
        </div>
        <div className="last-team">
          <span className="club-badge-sm">{acronym.get(away.clubId)}</span>
          <div>
            <strong>{away.name}</strong>
            <span className="muted">Visitante · {away.formation}</span>
          </div>
        </div>
      </div>

      <section className="card">
        <header className="card-head">
          <div>
            <h2>Em campo</h2>
            <p className="muted">
              Titulares de cada clube na formação da partida e os valores usados nos duelos, já com
              o efeito da condição.
            </p>
          </div>
          <div className="legend">
            <span>
              <span className="pitch-flag pitch-flag-weak">
                <HeartPulse size={10} aria-hidden="true" />
              </span>{' '}
              Mal condicionado
            </span>
            <span>
              <Volleyball size={14} aria-hidden="true" /> Gol no duelo
            </span>
          </div>
        </header>
        <div className="card-body">
          <Pitch home={home} away={away} />
        </div>
      </section>

      <section className="card">
        <header className="card-head">
          <div>
            <h2>Duelos</h2>
            <p className="muted">
              Os 3 ataques do mandante e depois os 3 do visitante. Os jogadores de linha vão do 1º
              (o mais recuado) ao 4º (o mais avançado), pela ordem do elenco: o 4º ataca o goleiro,
              o 3º ataca o 1º e o 2º ataca o 2º.
            </p>
          </div>
        </header>
        <div className="table-wrap table-flat">
          <table>
            <caption className="sr-only">Duelos da partida</caption>
            <thead>
              <tr>
                <th>Duelo</th>
                <th>Atacante</th>
                <th>Ataque</th>
                <th>Defensor</th>
                <th>Defesa</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {[
                { team: home, role: 'mandante', duels: homeDuels },
                { team: away, role: 'visitante', duels: awayDuels },
              ].map((group) => (
                <GroupRows
                  key={group.team.clubId}
                  acronym={acronym.get(group.team.clubId) ?? ''}
                  name={group.team.name}
                  role={group.role}
                  goals={group.team.goals}
                >
                  {group.duels.map((duel) => (
                    <DuelRow key={duel.order} duel={duel} match={data} clubName={clubName} />
                  ))}
                </GroupRows>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}

function GroupRows({
  acronym,
  name,
  role,
  goals,
  children,
}: {
  acronym: string
  name: string
  role: string
  goals: number
  children: React.ReactNode
}) {
  return (
    <>
      <tr className="group-row">
        <td colSpan={5}>
          <span className="badge badge-muted">{acronym}</span> Ataques do {name} ({role})
        </td>
        <td className="num">{goals === 1 ? '1 gol' : `${goals} gols`}</td>
      </tr>
      {children}
    </>
  )
}
