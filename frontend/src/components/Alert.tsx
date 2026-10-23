import { CircleAlert, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

interface AlertProps {
  // Vermelho para recusa ou falha; amarelo para um aviso que não impede a ação.
  tone: 'error' | 'warning'
  title: string
  children: ReactNode
  className?: string
}

// Aviso dentro da tela ou da janela (erro de carregamento, recusa da API, alerta
// de titular). Toda tela usa este mesmo bloco. O erro interrompe o leitor de tela
// (`alert`); o aviso espera a vez (`status`).
export function Alert({ tone, title, children, className }: AlertProps) {
  const Icon = tone === 'error' ? CircleAlert : TriangleAlert
  return (
    <div
      className={`alert alert-${tone}${className ? ` ${className}` : ''}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <Icon size={18} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  )
}
