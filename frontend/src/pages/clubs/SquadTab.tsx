import { HandCoins, Shirt } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { SquadPlayer } from '../../api/types'
import { Avatar, ConditionBadge, PositionBadge } from '../../components/Badges'
import { Button } from '../../components/Button'
import { DataTable } from '../../components/DataTable'
import type { Column } from '../../components/DataTable'
import { formatDateParts, formatMoney } from '../../lib/format'
import { PenaltyChip } from './PenaltyChip'
import { SellDialog } from './SellDialog'

interface SquadTabProps {
  clubName: string
  players: SquadPlayer[] | undefined
  // Quem é titular hoje: a venda de um titular avisa que ele sai da escalação.
  starterIds: Set<number>
  loading: boolean
  error: string | undefined
  onRetry: () => void
  // Chamado depois de uma venda, para a página do clube se atualizar.
  onSold: () => void
  onViewHistory: () => void
}

// O momento da consulta, em Brasília, para a nota "calculado para uma venda agora".
function nowInBrasilia(): string {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
  return parts.replace(' ', ', ')
}

// Elenco do clube, na ordem que a API devolve, com o contrato de cada jogador
// e o botão de vender. Dias restantes e % de multa vêm prontos da API.
export function SquadTab({
  clubName,
  players,
  starterIds,
  loading,
  error,
  onRetry,
  onSold,
  onViewHistory,
}: SquadTabProps) {
  const [selling, setSelling] = useState<SquadPlayer | null>(null)

  const columns: Column<SquadPlayer>[] = [
    {
      header: 'Jogador',
      render: (player) => (
        <span className="person person-inline">
          <Avatar name={player.name} />
          <strong>{player.name}</strong>
        </span>
      ),
    },
    { header: 'Posição', render: (player) => <PositionBadge position={player.position} /> },
    { header: 'Overall', numeric: true, render: (player) => <strong>{player.overall}</strong> },
    { header: 'Condição', render: (player) => <ConditionBadge condition={player.condition} /> },
    {
      header: 'Valor de mercado',
      numeric: true,
      render: (player) => <strong>{formatMoney(player.market_value)}</strong>,
    },
    {
      header: 'Valor de compra',
      numeric: true,
      render: (player) => (
        <span className="muted">
          {player.contract ? formatMoney(player.contract.purchase_value) : '—'}
        </span>
      ),
    },
    {
      header: 'Fim da fidelidade',
      render: (player) => {
        if (!player.contract) {
          return '—'
        }
        const when = formatDateParts(player.contract.loyalty_until)
        return (
          <span className="two-lines">
            {when.date}
            <span className="muted">{when.time}</span>
          </span>
        )
      },
    },
    {
      header: 'Dias restantes',
      numeric: true,
      render: (player) => player.contract?.remaining_days ?? '—',
    },
    {
      header: '% de multa',
      render: (player) =>
        player.contract ? <PenaltyChip rate={player.contract.penalty_rate} /> : '—',
    },
    {
      header: 'Ações',
      render: (player) => (
        <Button onClick={() => setSelling(player)} aria-label={`Vender ${player.name}`}>
          <HandCoins size={16} aria-hidden="true" /> Vender
        </Button>
      ),
    },
  ]

  return (
    <>
      <section className="card">
        <header className="card-head">
          <div>
            <h2>Elenco</h2>
            <p className="muted">
              Ordem por posição (GOL, ZAG, LAT, MEI, ATA), depois pelo nome. Contrato calculado para
              uma venda agora.
            </p>
          </div>
        </header>
        <DataTable
          caption="Elenco do clube"
          columns={columns}
          rows={players}
          rowKey={(player) => player.id}
          loading={loading}
          error={error}
          onRetry={onRetry}
          errorTitle="Não foi possível carregar o elenco"
          empty={{
            icon: <Shirt size={20} aria-hidden="true" />,
            title: 'O clube ainda não tem jogadores',
            description: 'Compre jogadores livres para formar o elenco.',
            action: (
              <Link className="btn" to="/jogadores">
                Comprar jogadores
              </Link>
            ),
          }}
        />
      </section>
      {players && players.length > 0 && (
        <p className="page-note muted">
          Valor de mercado, dias restantes e % de multa calculados para uma venda agora (
          {nowInBrasilia()}). A multa tem teto de 10,00.
        </p>
      )}

      {selling && (
        <SellDialog
          player={selling}
          clubName={clubName}
          isStarter={starterIds.has(selling.id)}
          onClose={() => setSelling(null)}
          onSold={onSold}
          onViewHistory={onViewHistory}
        />
      )}
    </>
  )
}
