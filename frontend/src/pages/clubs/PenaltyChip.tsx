import { Check } from 'lucide-react'

// A % de multa da venda de agora, com cor pelo tamanho: 0% verde, 5% e 10%
// amarelo, 20% vermelho. O número vem da API.
export function PenaltyChip({ rate }: { rate: number }) {
  const tone = rate === 0 ? 'success' : rate >= 20 ? 'destructive' : 'warning'
  return (
    <span className={`badge badge-${tone}`}>
      {rate === 0 && <Check size={12} aria-hidden="true" />}
      {rate}%
    </span>
  )
}
