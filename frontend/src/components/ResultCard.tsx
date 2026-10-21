import type { ReactNode } from 'react'

export interface ResultCardItem {
  label: string
  // Frase menor logo abaixo do rótulo.
  sub?: string
  value: ReactNode
  // Linha em destaque (fundo cinza e texto mais forte).
  highlight?: boolean
}

// Resultado de uma operação (compra, venda): uma lista de linhas com rótulo,
// explicação e valor. Os valores são os que a API devolveu.
export function ResultCard({ items }: { items: ResultCardItem[] }) {
  return (
    <dl className="result-list result-card">
      {items.map((item) => (
        <div key={item.label} className={`result-row${item.highlight ? ' result-highlight' : ''}`}>
          <dt>
            {item.highlight ? <strong>{item.label}</strong> : item.label}
            {item.sub && <span className="option-desc">{item.sub}</span>}
          </dt>
          <dd>{item.highlight ? <strong>{item.value}</strong> : item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
