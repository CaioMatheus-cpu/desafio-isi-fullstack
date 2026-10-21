import { PanelLeft, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { listClubs } from '../api/clubs'
import { listMatches } from '../api/matches'
import { listPlayers } from '../api/players'
import { useRequest } from '../hooks/useRequest'
import { Sidebar } from './Sidebar'
import type { League } from './Sidebar'

async function loadLeague(): Promise<League> {
  const [clubs, players, matches] = await Promise.all([
    listClubs('name'),
    listPlayers({ sort: 'name', page: 1 }),
    listMatches(),
  ])
  return { clubs, playerCount: players.meta.total_items, matches }
}

interface Crumb {
  label: string
  to?: string
}

// "Mercado › Clubes › Águias FC": o caminho da página atual.
function breadcrumb(pathname: string, league?: League): Crumb[] {
  if (pathname.startsWith('/clubes/')) {
    const id = Number(pathname.split('/')[2])
    const club = league?.clubs.find((item) => item.id === id)
    return [
      { label: 'Mercado' },
      { label: 'Clubes', to: '/clubes' },
      { label: club?.name ?? `Clube ${pathname.split('/')[2]}` },
    ]
  }
  if (pathname === '/clubes') {
    return [{ label: 'Mercado' }, { label: 'Clubes' }]
  }
  if (pathname.startsWith('/partidas/')) {
    const id = Number(pathname.split('/')[2])
    const match = league?.matches.find((item) => item.id === id)
    return [
      { label: 'Liga' },
      { label: 'Partidas', to: '/partidas' },
      {
        label: match
          ? `${match.home.club_name} ${match.home.goals} × ${match.away.goals} ${match.away.club_name}`
          : `Partida ${pathname.split('/')[2]}`,
      },
    ]
  }
  if (pathname === '/partidas') {
    return [{ label: 'Liga' }, { label: 'Partidas' }]
  }
  if (pathname === '/classificacao') {
    return [{ label: 'Liga' }, { label: 'Classificação' }]
  }
  return [{ label: 'Mercado' }, { label: 'Jogadores' }]
}

// Barra lateral, faixa com o caminho da página e o espaço onde cada página
// aparece. O botão de atualizar refaz todos os pedidos da página e da lateral.
export function Layout() {
  const { pathname } = useLocation()
  const [refresh, setRefresh] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const league = useRequest(loadLeague, `league-${pathname}-${refresh}`)
  const crumbs = breadcrumb(pathname, league.data)

  return (
    <div className={`app${collapsed ? ' app-collapsed' : ''}`}>
      <Sidebar league={league.data} />
      <div className="app-main">
        <div className="topbar">
          <button
            type="button"
            className="icon-btn"
            aria-label={collapsed ? 'Mostrar menu lateral' : 'Ocultar menu lateral'}
            onClick={() => setCollapsed((value) => !value)}
          >
            <PanelLeft size={18} aria-hidden="true" />
          </button>
          <nav className="breadcrumb" aria-label="Caminho da página">
            {crumbs.map((crumb, index) => (
              <span key={crumb.label}>
                {index > 0 && <span className="breadcrumb-sep"> › </span>}
                {crumb.to ? (
                  <Link to={crumb.to}>{crumb.label}</Link>
                ) : (
                  <span aria-current={index === crumbs.length - 1 ? 'page' : undefined}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
          <button
            type="button"
            className="icon-btn topbar-end"
            aria-label="Atualizar dados"
            onClick={() => setRefresh((value) => value + 1)}
          >
            <RefreshCw size={18} aria-hidden="true" />
          </button>
        </div>
        <main className="page" key={refresh}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
