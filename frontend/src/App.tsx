import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { NoticeProvider } from './components/NoticeProvider'
import { ClubPage } from './pages/clubs/ClubPage'
import { ClubsPage } from './pages/clubs/ClubsPage'
import { MatchesPage } from './pages/matches/MatchesPage'
import { MatchPage } from './pages/matches/MatchPage'
import { StandingsPage } from './pages/matches/StandingsPage'
import { PlayersPage } from './pages/players/PlayersPage'
import { WelcomePage } from './pages/WelcomePage'

export default function App() {
  return (
    <NoticeProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<WelcomePage />} />
          <Route element={<Layout />}>
            <Route path="/jogadores" element={<PlayersPage />} />
            <Route path="/clubes" element={<ClubsPage />} />
            <Route path="/clubes/:id" element={<ClubPage />} />
            <Route path="/partidas" element={<MatchesPage />} />
            <Route path="/partidas/:id" element={<MatchPage />} />
            <Route path="/classificacao" element={<StandingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </NoticeProvider>
  )
}
