import { Clock, ListOrdered, Plus, Shield, Swords, Trophy, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { LogoMark } from './Logo'
import type { Club, MatchSummary } from '../api/types'

export interface League {
  clubs: Club[]
  playerCount: number
  matches: MatchSummary[]
}

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  count?: number
}

function NavGroup({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="sidebar-group">
      <p className="sidebar-title">{title}</p>
      {items.map((item) => (
        <NavLink key={item.to} to={item.to} end className="sidebar-link">
          <item.icon size={18} aria-hidden="true" />
          <span>{item.label}</span>
          {item.count !== undefined && <span className="sidebar-count">{item.count}</span>}
        </NavLink>
      ))}
    </div>
  )
}

// Menu lateral: páginas, clubes cadastrados e um resumo da liga. Os números
// vêm da própria API, nada é calculado aqui.
export function Sidebar({ league }: { league?: League }) {
  const lastMatch = league?.matches[0]

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <LogoMark size={36} />
        <div>
          <strong>Passe</strong>
          <p>Gestão da liga</p>
        </div>
      </div>

      <nav aria-label="Principal">
        <NavGroup
          title="Mercado"
          items={[
            { to: '/jogadores', label: 'Jogadores', icon: Users, count: league?.playerCount },
            { to: '/clubes', label: 'Clubes', icon: Shield, count: league?.clubs.length },
          ]}
        />
        <NavGroup
          title="Liga"
          items={[
            { to: '/partidas', label: 'Partidas', icon: Swords, count: league?.matches.length },
            { to: '/classificacao', label: 'Classificação', icon: ListOrdered },
          ]}
        />
      </nav>

      <div className="sidebar-group sidebar-clubs">
        <p className="sidebar-title">
          Clubes
          <Link to="/clubes" className="icon-btn icon-btn-sm" aria-label="Ver e criar clubes">
            <Plus size={16} aria-hidden="true" />
          </Link>
        </p>
        {league?.clubs.map((club) => (
          <NavLink key={club.id} to={`/clubes/${club.id}`} className="sidebar-link">
            <span className="club-initial" aria-hidden="true">
              {club.name.charAt(0)}
            </span>
            <span>{club.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-league">
        <div className="league-row">
          <Trophy size={20} aria-hidden="true" />
          <div>
            <strong>Liga Fictícia 2026</strong>
            <p>
              {league
                ? `${league.clubs.length} clubes · ${league.playerCount} jogadores`
                : 'Carregando...'}
            </p>
          </div>
        </div>
        <div className="league-row">
          <Swords size={20} aria-hidden="true" />
          <div>
            <strong>Última partida</strong>
            <p>
              {lastMatch
                ? `${lastMatch.home.club_name} ${lastMatch.home.goals} × ${lastMatch.away.goals} ${lastMatch.away.club_name}`
                : 'Nenhuma partida ainda'}
            </p>
          </div>
        </div>
        <p className="league-clock">
          <Clock size={14} aria-hidden="true" /> Horário de Brasília (UTC-3)
        </p>
      </div>
    </aside>
  )
}
