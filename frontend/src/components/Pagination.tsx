import { Button } from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  // Como chamar os itens no singular e no plural ("jogador", "jogadores").
  singular: string
  plural: string
  onChange: (page: number) => void
}

// Navegação entre páginas e o total de itens encontrados.
export function Pagination({
  page,
  totalPages,
  totalItems,
  singular,
  plural,
  onChange,
}: PaginationProps) {
  return (
    <nav className="pagination" aria-label="Paginação">
      <span>
        {totalItems === 1
          ? `1 ${singular} encontrado`
          : `${totalItems} ${plural} encontrados`}
      </span>
      <div className="pagination-controls">
        <Button disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Anterior
        </Button>
        <span>
          Página {totalPages === 0 ? 0 : page} de {totalPages}
        </span>
        <Button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Próxima
        </Button>
      </div>
    </nav>
  )
}
