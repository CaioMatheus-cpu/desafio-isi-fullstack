import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  // Como chamar os itens no singular e no plural ("jogador", "jogadores").
  singular: string
  plural: string
  onChange: (page: number) => void
}

// Navegação entre páginas e o intervalo mostrado ("Mostrando 1–10 de 23 jogadores").
export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  singular,
  plural,
  onChange,
}: PaginationProps) {
  const first = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, totalItems)
  const numbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav className="pagination" aria-label="Paginação">
      <span className="muted">
        Mostrando {first}–{last} de {totalItems} {totalItems === 1 ? singular : plural}
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          className="page-step"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft size={14} aria-hidden="true" /> Anterior
        </button>
        {numbers.map((number) => (
          <button
            key={number}
            type="button"
            className={`page-number${number === page ? ' page-current' : ''}`}
            aria-current={number === page ? 'page' : undefined}
            aria-label={`Página ${number}`}
            onClick={() => onChange(number)}
          >
            {number}
          </button>
        ))}
        <button
          type="button"
          className="page-step"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Próxima <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
