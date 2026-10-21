import {
  ArrowLeft,
  ClipboardList,
  Coins,
  History,
  Landmark,
  SearchX,
  Shirt,
  ShoppingCart,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getClub } from '../../api/clubs'
import { getLineup } from '../../api/lineups'
import { listTransactions } from '../../api/transactions'
import { Button } from '../../components/Button'
import { Tabs } from '../../components/Tabs'
import { SQUAD_LIMIT } from '../../config'
import { useRequest } from '../../hooks/useRequest'
import { formatMoney } from '../../lib/format'
import { HistoryTab } from './HistoryTab'
import { LineupTab } from './LineupTab'
import { SquadTab } from './SquadTab'

type ClubTab = 'squad' | 'lineup' | 'history'

function Stat({
  label,
  icon,
  value,
  unit,
  note,
}: {
  label: string
  icon: React.ReactNode
  value: string
  unit?: string
  note: string
}) {
  return (
    <div className="stat">
      <span className="stat-head">
        {label}
        {icon}
      </span>
      <strong>
        {value} {unit && <small>{unit}</small>}
      </strong>
      <small>{note}</small>
    </div>
  )
}

export function ClubPage() {
  const { id } = useParams()
  const clubId = Number(id)
  const [tab, setTab] = useState<ClubTab>('squad')
  // Sobe a cada venda: a página do clube e as abas consultam a API de novo.
  const [version, setVersion] = useState(0)
  const [lineupVersion, setLineupVersion] = useState(0)
  const club = useRequest(() => getClub(clubId), `club-${clubId}-${version}`)
  const lineup = useRequest(() => getLineup(clubId), `lineup-${clubId}-${version}-${lineupVersion}`)
  const transactions = useRequest(
    () => listTransactions(clubId, { types: [] }),
    `club-transactions-${clubId}-${version}`,
  )

  if (club.error) {
    // 404 é endereço errado; qualquer outro erro vira o aviso com "Tentar de novo".
    const missing = club.error.toLowerCase().includes('não encontrado') || !Number.isInteger(clubId)
    return (
      <section>
        <div className="state-box state-empty">
          <span className="state-icon">
            <SearchX size={20} aria-hidden="true" />
          </span>
          <strong>{missing ? 'Clube não encontrado' : 'Não foi possível carregar o clube'}</strong>
          <p className="muted">
            {missing
              ? 'Clube não encontrado. O endereço pode estar errado ou o clube não existe.'
              : club.error}
          </p>
          {missing ? (
            <Link className="btn" to="/clubes">
              <ArrowLeft size={16} aria-hidden="true" /> Voltar para clubes
            </Link>
          ) : (
            <Button onClick={club.reload}>Tentar de novo</Button>
          )}
        </div>
      </section>
    )
  }

  const data = club.data
  const starterIds = new Set(lineup.data?.players.map((player) => player.id) ?? [])

  return (
    <section>
      <div className="page-head">
        <div className="page-title">
          <span className="club-badge" aria-hidden="true">
            {data?.acronym}
          </span>
          <div>
            <h1>{data?.name ?? 'Clube'}</h1>
            {data && (
              <p className="chip-row">
                <span className="badge badge-outline">Sigla {data.acronym}</span>
                <span className="badge badge-outline">
                  <Shirt size={12} aria-hidden="true" /> {data.players.length} de {SQUAD_LIMIT}{' '}
                  jogadores
                </span>
              </p>
            )}
          </div>
        </div>
        <Link to="/jogadores" className="btn btn-primary btn-link-style">
          <ShoppingCart size={16} aria-hidden="true" /> Comprar jogadores
        </Link>
      </div>

      {data && (
        <div className="stats">
          <Stat
            label="Caixa"
            icon={<Wallet size={16} aria-hidden="true" />}
            value={formatMoney(data.cash)}
            unit="moedas"
            note="Só muda por compras e vendas"
          />
          <Stat
            label="Valor do elenco"
            icon={<Coins size={16} aria-hidden="true" />}
            value={formatMoney(data.squad_value)}
            unit="moedas"
            note="Soma dos valores de mercado"
          />
          <Stat
            label="Patrimônio"
            icon={<Landmark size={16} aria-hidden="true" />}
            value={formatMoney(data.net_worth)}
            unit="moedas"
            note="Caixa + valor do elenco"
          />
          <Stat
            label="Elenco"
            icon={<Shirt size={16} aria-hidden="true" />}
            value={`${data.players.length} de ${SQUAD_LIMIT}`}
            note={`Limite de ${SQUAD_LIMIT} jogadores`}
          />
        </div>
      )}

      <Tabs
        tabs={[
          {
            id: 'squad',
            label: 'Elenco',
            icon: <Shirt size={16} aria-hidden="true" />,
            count: data?.players.length,
          },
          {
            id: 'lineup',
            label: 'Escalação',
            icon: <ClipboardList size={16} aria-hidden="true" />,
          },
          {
            id: 'history',
            label: 'Histórico',
            icon: <History size={16} aria-hidden="true" />,
            count: transactions.data?.data.length,
          },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'squad' && (
        <SquadTab
          clubName={data?.name ?? 'clube'}
          players={data?.players}
          starterIds={starterIds}
          loading={club.loading}
          error={club.error}
          onRetry={club.reload}
          onSold={() => setVersion((value) => value + 1)}
          onViewHistory={() => setTab('history')}
        />
      )}
      {tab === 'lineup' && (
        <LineupTab
          clubId={clubId}
          clubName={data?.name ?? 'clube'}
          squad={data?.players ?? []}
          lineup={lineup.data}
          error={lineup.error}
          onSaved={() => setLineupVersion((value) => value + 1)}
        />
      )}
      {tab === 'history' && <HistoryTab clubId={clubId} version={version} />}
    </section>
  )
}
