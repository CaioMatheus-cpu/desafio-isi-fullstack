import {
  ArrowRight,
  CircleCheck,
  Clock,
  History,
  Shield,
  ShoppingCart,
  Swords,
  Trophy,
  User,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listClubs } from '../api/clubs'
import { listMatches, listStandings } from '../api/matches'
import { listPlayers } from '../api/players'
import { LogoFull } from '../components/Logo'
import { useRequest } from '../hooks/useRequest'

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Users,
    title: 'Jogadores',
    text: 'Nascem livres e Apto; o valor de mercado vem da condição, agilidade e idade.',
  },
  { icon: Shield, title: 'Clubes', text: 'Começam com 300,00 em caixa e sem jogadores.' },
  {
    icon: ShoppingCart,
    title: 'Compra',
    text: 'Valor + taxa, até 50% do caixa, com contrato de fidelidade.',
  },
  {
    icon: Swords,
    title: 'Venda',
    text: 'Multa antes do fim da fidelidade e comissão sobre o lucro.',
  },
  {
    icon: History,
    title: 'Histórico',
    text: 'Toda compra e venda fica registrada, com totais e CSV.',
  },
  {
    icon: Trophy,
    title: 'Liga',
    text: 'Escale 5 titulares e jogue partidas que entram na classificação.',
  },
]

// Os números do resumo vêm da API: nada é contado aqui.
async function loadSummary() {
  const [all, free, clubs, matches, standings] = await Promise.all([
    listPlayers({ sort: 'name', page: 1 }),
    listPlayers({ sort: 'name', page: 1, free: true }),
    listClubs(),
    listMatches(),
    listStandings(),
  ])
  return {
    players: all.meta.total_items,
    free: free.meta.total_items,
    clubs: clubs.length,
    matches: matches.length,
    leader: matches.length > 0 ? standings[0] : undefined,
  }
}

// Tela de abertura: apresenta o sistema e leva à lista de jogadores.
export function WelcomePage() {
  const navigate = useNavigate()
  const summary = useRequest(loadSummary, 'welcome').data

  useEffect(() => {
    function startOnEnter(event: KeyboardEvent) {
      if (event.key === 'Enter' && !(event.target instanceof HTMLButtonElement)) {
        navigate('/jogadores')
      }
    }
    document.addEventListener('keydown', startOnEnter)
    return () => document.removeEventListener('keydown', startOnEnter)
  }, [navigate])

  return (
    <div className="welcome">
      <div className="welcome-pitch" aria-hidden="true">
        <span className="pitch-line pitch-middle" />
        <span className="pitch-circle" />
        <span className="pitch-box pitch-box-left" />
        <span className="pitch-box pitch-box-right" />
      </div>

      <main className="welcome-content">
        <div className="welcome-brand">
          <LogoFull height={52} />
        </div>

        <p className="welcome-status">
          <span className="status-dot" aria-hidden="true" />
          <strong>Liga Fictícia 2026</strong>
          <span className="muted">
            ·{' '}
            {summary?.leader
              ? `líder: ${summary.leader.club_name}, ${summary.leader.points} pontos`
              : 'nenhuma partida ainda'}
          </span>
        </p>

        <h1 className="welcome-title">Gestão da liga, do mercado à classificação</h1>
        <p className="welcome-lead">
          Cadastre jogadores, monte os clubes e negocie com contrato de fidelidade. Depois, escale
          os titulares e jogue partidas com placar calculado pelos atributos.
        </p>

        <div className="welcome-start">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/jogadores')}
          >
            Iniciar <ArrowRight size={16} aria-hidden="true" />
          </button>
          <span className="muted">
            ou tecle <kbd>Enter</kbd>
          </span>
        </div>

        <ul className="welcome-stats">
          <li>
            <Users size={14} aria-hidden="true" /> <strong>{summary?.players ?? '–'}</strong>{' '}
            jogadores
          </li>
          <li>
            <User size={14} aria-hidden="true" /> <strong>{summary?.free ?? '–'}</strong> livres
          </li>
          <li>
            <Shield size={14} aria-hidden="true" /> <strong>{summary?.clubs ?? '–'}</strong> clubes
          </li>
          <li>
            <Swords size={14} aria-hidden="true" /> <strong>{summary?.matches ?? '–'}</strong>{' '}
            partidas
          </li>
          <li>
            <CircleCheck size={14} aria-hidden="true" /> Não precisa de login
          </li>
        </ul>

        <ol className="welcome-steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="welcome-step">
              <span className="step-head">
                <span className="step-icon">
                  <step.icon size={16} aria-hidden="true" />
                </span>
                <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
              </span>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>

        <p className="welcome-foot">
          <Clock size={14} aria-hidden="true" /> Liga Fictícia 2026 · Horário de Brasília (UTC-3)
        </p>
      </main>
    </div>
  )
}
