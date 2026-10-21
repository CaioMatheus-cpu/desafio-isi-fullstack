import { ArrowLeft, ArrowRight, HeartPulse, Volleyball } from 'lucide-react'
import { placeTeam } from '../lib/match-view'
import type { Placement, TeamView } from '../lib/match-view'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : ''
  return ((parts[0]?.charAt(0) ?? '') + last).toUpperCase()
}

function Token({ placement, side }: { placement: Placement; side: 'home' | 'away' }) {
  const { player } = placement
  const uses = player.uses.map((use) => `${use.short} ${use.value}`).join(' · ')
  const weakened = player.condition === 'MAL_CONDICIONADO'
  return (
    <div className="pitch-player" style={{ left: `${placement.x}%`, top: `${placement.y}%` }}>
      <span className={`pitch-token pitch-token-${side}`}>
        {initials(player.name)}
        {weakened && (
          <span
            className="pitch-flag pitch-flag-weak"
            title="Mal condicionado: joga com 15% a menos"
          >
            <HeartPulse size={10} aria-hidden="true" />
            <span className="sr-only">Mal condicionado</span>
          </span>
        )}
        {player.scored && (
          <span className="pitch-flag pitch-flag-goal" title="Gol no duelo">
            <Volleyball size={11} aria-hidden="true" />
            <span className="sr-only">Gol no duelo</span>
          </span>
        )}
      </span>
      <span className="pitch-name">{player.name}</span>
      <span className="pitch-uses">
        {player.position} · {uses}
      </span>
    </div>
  )
}

function Tag({ team, side }: { team: TeamView; side: 'home' | 'away' }) {
  const Arrow = side === 'home' ? ArrowRight : ArrowLeft
  return (
    <span className={`pitch-tag pitch-tag-${side}`}>
      <span className={`pitch-dot pitch-dot-${side}`} aria-hidden="true" />
      {team.name} {team.formation} <span className="pitch-tag-sep">|</span> ataca
      <Arrow size={12} aria-hidden="true" />
    </span>
  )
}

// O campo da partida: mandante à esquerda (azul) e visitante à direita (branco).
export function Pitch({ home, away }: { home: TeamView; away: TeamView }) {
  return (
    <div className="pitch" role="img" aria-label={`Campo: ${home.name} contra ${away.name}`}>
      <div className="pitch-lines" aria-hidden="true">
        <span className="pitch-half" />
        <span className="pitch-center" />
        <span className="pitch-area pitch-area-left" />
        <span className="pitch-area pitch-area-right" />
      </div>
      <Tag team={home} side="home" />
      <Tag team={away} side="away" />
      {placeTeam(home, false).map((placement) => (
        <Token key={`h${placement.player.id}`} placement={placement} side="home" />
      ))}
      {placeTeam(away, true).map((placement) => (
        <Token key={`a${placement.player.id}`} placement={placement} side="away" />
      ))}
    </div>
  )
}
