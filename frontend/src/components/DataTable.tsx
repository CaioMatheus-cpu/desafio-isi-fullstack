import type { ReactNode } from 'react'
import { Button } from './Button'

export interface Column<T> {
  header: string
  render: (row: T) => ReactNode
  // Alinha à direita as colunas de números.
  numeric?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[] | undefined
  rowKey: (row: T) => string | number
  loading: boolean
  error: string | undefined
  onRetry: () => void
  emptyText: string
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
  onRetry,
  emptyText,
  caption,
}: DataTableProps<T>) {
  if (error) {
    return (
      <div className="state state-error" role="alert">
        <p>{error}</p>
        <Button onClick={onRetry}>Tentar de novo</Button>
      </div>
    )
  }
  if (loading && !rows) {
    return (
      <div className="state" role="status" aria-busy="true">
        Carregando...
      </div>
    )
  }
  if (!rows || rows.length === 0) {
    return <div className="state">{emptyText}</div>
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
