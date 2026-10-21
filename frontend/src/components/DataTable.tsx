import { CircleAlert, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

export interface Column<T> {
  header: string
  render: (row: T) => ReactNode
  // Alinha à direita as colunas de números.
  numeric?: boolean
}

// O que mostrar quando a lista chega vazia.
export interface EmptyState {
  title: string
  description?: string
  // Botão que leva ao próximo passo (por exemplo, "Novo jogador").
  action?: ReactNode
  icon?: ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[] | undefined
  rowKey: (row: T) => string | number
  loading: boolean
  error: string | undefined
  // Título do erro, no estilo "Não foi possível carregar os jogadores".
  errorTitle?: string
  onRetry: () => void
  empty: EmptyState
  caption?: string
}

// Tabela que toda lista do sistema usa. Cuida dos três estados que uma lista
// precisa mostrar: carregando, vazia e com erro (com botão para tentar de novo).
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  errorTitle = 'Não foi possível carregar os dados',
  onRetry,
  empty,
  caption,
}: DataTableProps<T>) {
  if (error) {
    return (
      <div className="state-box">
        <div className="alert alert-error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <div>
            <strong>{errorTitle}</strong>
            <p>{error}</p>
          </div>
        </div>
        <Button onClick={onRetry}>
          <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
        </Button>
      </div>
    )
  }
  if (loading && !rows) {
    return (
      <div className="state-box" role="status" aria-busy="true">
        <div className="skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="muted">Carregando...</p>
      </div>
    )
  }
  if (!rows || rows.length === 0) {
    return (
      <div className="state-box state-empty">
        {empty.icon && <span className="state-icon">{empty.icon}</span>}
        <strong>{empty.title}</strong>
        {empty.description && <p className="muted">{empty.description}</p>}
        {empty.action}
      </div>
    )
  }

  return (
    <div className={`table-wrap${loading ? ' table-loading' : ''}`} aria-busy={loading}>
      <table>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header} className={column.numeric ? 'num' : undefined}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.header} className={column.numeric ? 'num' : undefined}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
