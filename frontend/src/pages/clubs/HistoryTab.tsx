import {
  CircleAlert,
  Download,
  HandCoins,
  History,
  Percent,
  ShoppingCart,
  TrendingDown,
  TriangleAlert,
  User,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { exportTransactions, listTransactions } from '../../api/transactions'
import { TRANSACTION_TYPES } from '../../api/types'
import type { Transaction, TransactionType } from '../../api/types'
import { Avatar } from '../../components/Badges'
import { Button } from '../../components/Button'
import { DataTable } from '../../components/DataTable'
import type { Column } from '../../components/DataTable'
import { useNotice } from '../../hooks/notice-context'
import { useRequest } from '../../hooks/useRequest'
import { saveFile } from '../../lib/download'
import { messageOf } from '../../lib/errors'
import { formatDateParts, formatMoney, formatSignedMoney } from '../../lib/format'

interface HistoryTabProps {
  clubId: number
  // Muda quando o clube compra ou vende, para o histórico ser consultado de novo.
  version: number
}

function toneOf(value: number): string {
  return value > 0 ? 'tone-positive' : value < 0 ? 'tone-negative' : ''
}

const COLUMNS: Column<Transaction>[] = [
  {
    header: 'Data e hora',
    render: (item) => {
      const when = formatDateParts(item.created_at)
      return (
        <span>
          {when.date} <span className="muted">{when.time}</span>
        </span>
      )
    },
  },
  {
    header: 'Tipo',
    render: (item) => (
      <span className="badge badge-muted">
        {item.type === 'COMPRA' ? (
          <ShoppingCart size={12} aria-hidden="true" />
        ) : (
          <HandCoins size={12} aria-hidden="true" />
        )}
        {item.type === 'COMPRA' ? 'Compra' : 'Venda'}
      </span>
    ),
  },
  {
    header: 'Jogador',
    render: (item) => (
      <span className="person person-inline">
        <Avatar name={item.player_name} />
        <strong>{item.player_name}</strong>
      </span>
    ),
  },
  { header: 'Valor', numeric: true, render: (item) => formatMoney(item.value) },
  { header: 'Taxa ou comissão', numeric: true, render: (item) => formatMoney(item.fee) },
  { header: 'Multa', numeric: true, render: (item) => formatMoney(item.penalty) },
  {
    header: 'Lucro',
    numeric: true,
    render: (item) =>
      item.profit === null ? (
        <span className="muted">–</span>
      ) : (
        <span className={toneOf(item.profit)}>{formatSignedMoney(item.profit)}</span>
      ),
  },
  {
    header: 'Variação do caixa',
    numeric: true,
    render: (item) => (
      <strong className={toneOf(item.cash_change)}>{formatSignedMoney(item.cash_change)}</strong>
    ),
  },
]

// Histórico de compras e vendas do clube, com filtro por tipo e por jogador,
// os totais do filtro (vindos da API) e a exportação em CSV.
export function HistoryTab({ clubId, version }: HistoryTabProps) {
  const { notify } = useNotice()
  const [types, setTypes] = useState<TransactionType[]>([])
  const [playerId, setPlayerId] = useState('')
  const [exporting, setExporting] = useState(false)

  const filters = useMemo(
    () => ({ types, playerId: playerId === '' ? undefined : Number(playerId) }),
    [types, playerId],
  )
  const history = useRequest(
    () => listTransactions(clubId, filters),
    `history-${clubId}-${types.join(',')}-${playerId}-${version}`,
  )
  // Os jogadores do filtro saem do histórico completo, sem filtro nenhum.
  const everything = useRequest(
    () => listTransactions(clubId, { types: [] }),
    `history-all-${clubId}-${version}`,
  )

  const players = useMemo(() => {
    const byId = new Map(
      (everything.data?.data ?? []).map((item) => [item.player_id, item.player_name]),
    )
    return [...byId.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [everything.data])

  const filtered = types.length > 0 || playerId !== ''
  const checked = (type: TransactionType) => types.length === 0 || types.includes(type)

  // As duas caixas marcadas é o mesmo que nenhum filtro de tipo; desmarcar a
  // última que sobra não é permitido (a lista ficaria sem tipo nenhum).
  function toggleType(type: TransactionType) {
    const current = TRANSACTION_TYPES.filter(checked)
    const next = current.includes(type)
      ? current.filter((item) => item !== type)
      : [...current, type]
    if (next.length === 0) {
      return
    }
    setTypes(next.length === TRANSACTION_TYPES.length ? [] : next)
  }

  function clearFilters() {
    setTypes([])
    setPlayerId('')
  }

  async function exportCsv() {
    if (exporting) {
      return
    }
    setExporting(true)
    try {
      const file = await exportTransactions(clubId, filters)
      saveFile(file.blob, file.filename)
      const parts: string[] = []
      if (types.length > 0) {
        parts.push(
          `de tipo ${types.map((type) => (type === 'COMPRA' ? 'Compra' : 'Venda')).join(' e ')}`,
        )
      }
      if (playerId !== '') {
        parts.push(`de jogador ${players.find(([id]) => String(id) === playerId)?.[1] ?? playerId}`)
      }
      notify(
        'success',
        parts.length > 0
          ? `${file.filename}, com o filtro ${parts.join(' e ')} aplicado.`
          : `${file.filename}, com todas as transações.`,
        'CSV baixado',
      )
    } catch (error) {
      notify('error', messageOf(error))
    } finally {
      setExporting(false)
    }
  }

  const summary = history.data?.summary
  const hasRows = (history.data?.data.length ?? 0) > 0

  return (
    <section className="card">
      <header className="card-head">
        <div>
          <h2>Histórico de transações</h2>
          <p className="muted">
            Da mais recente para a mais antiga, com o nome e os valores do momento de cada operação.
          </p>
        </div>
        <Button onClick={exportCsv} busy={exporting}>
          <Download size={16} aria-hidden="true" /> Exportar CSV
        </Button>
      </header>

      <div className="history-filters">
        <fieldset className="type-filter">
          <legend>Tipo</legend>
          {TRANSACTION_TYPES.map((type) => (
            <label key={type} className={`check-chip${checked(type) ? ' check-chip-on' : ''}`}>
              <input type="checkbox" checked={checked(type)} onChange={() => toggleType(type)} />
              {type === 'COMPRA' ? 'Compra' : 'Venda'}
            </label>
          ))}
        </fieldset>
        <label className="select-inline">
          <User size={16} aria-hidden="true" />
          <span>Jogador:</span>
          <select value={playerId} onChange={(event) => setPlayerId(event.target.value)}>
            <option value="">todos</option>
            {players.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        {filtered && (
          <button type="button" className="link-button" onClick={clearFilters}>
            Limpar filtros
          </button>
        )}
      </div>

      {history.error && filtered ? (
        <div className="alert alert-error lineup-alert" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <div>
            <strong>O filtro foi recusado</strong>
            <p>{history.error}</p>
          </div>
        </div>
      ) : (
        <DataTable
          caption="Histórico de transações"
          columns={COLUMNS}
          rows={history.data?.data}
          rowKey={(item) => item.id}
          loading={history.loading}
          error={history.error}
          onRetry={history.reload}
          errorTitle="Não foi possível carregar o histórico"
          empty={
            filtered
              ? {
                  icon: <History size={20} aria-hidden="true" />,
                  title: 'Nenhuma transação encontrada',
                  description: 'Nenhuma compra ou venda atende a esses filtros.',
                  action: <Button onClick={clearFilters}>Limpar filtros</Button>,
                }
              : {
                  icon: <History size={20} aria-hidden="true" />,
                  title: 'Nenhuma compra ou venda',
                  description: 'As compras e vendas do clube aparecem aqui, com os totais.',
                }
          }
        />
      )}

      {summary && !history.error && (hasRows || !filtered) && (
        <div className="totals" aria-label="Totais do filtro">
          <div>
            <span className="muted">
              <ShoppingCart size={14} aria-hidden="true" /> Total pago em compras
            </span>
            <strong>{formatMoney(summary.total_spent)}</strong>
            <span className="muted">Valor + taxa</span>
          </div>
          <div>
            <span className="muted">
              <HandCoins size={14} aria-hidden="true" /> Total recebido em vendas
            </span>
            <strong>{formatMoney(summary.total_received)}</strong>
            <span className="muted">Crédito líquido</span>
          </div>
          <div>
            <span className="muted">
              <Percent size={14} aria-hidden="true" /> Taxas e comissões
            </span>
            <strong>{formatMoney(summary.total_fees)}</strong>
            <span className="muted">Somadas</span>
          </div>
          <div>
            <span className="muted">
              <TriangleAlert size={14} aria-hidden="true" /> Multas
            </span>
            <strong>{formatMoney(summary.total_penalties)}</strong>
            <span className="muted">Por fidelidade</span>
          </div>
          <div>
            <span className="muted">
              <TrendingDown size={14} aria-hidden="true" /> Lucro total
            </span>
            <strong className={toneOf(summary.total_profit)}>
              {formatSignedMoney(summary.total_profit)}
            </strong>
            <span className="muted">Soma dos lucros, com sinal</span>
          </div>
        </div>
      )}
    </section>
  )
}
