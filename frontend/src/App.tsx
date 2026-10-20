import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { NoticeProvider } from './components/NoticeProvider'
import { PlayersPage } from './pages/players/PlayersPage'

export default function App() {
  return (
    <NoticeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/jogadores" replace />} />
            <Route path="/jogadores" element={<PlayersPage />} />
            <Route path="*" element={<Navigate to="/jogadores" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </NoticeProvider>
  )
}
