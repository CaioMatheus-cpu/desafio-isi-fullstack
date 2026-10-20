import { NavLink, Outlet } from 'react-router-dom'

const LINKS = [{ to: '/jogadores', label: 'Jogadores' }]

// Cabeçalho com o menu e o espaço onde cada página aparece.
export function Layout() {
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <span className="brand">Passe</span>
          <nav aria-label="Principal">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  )
}
