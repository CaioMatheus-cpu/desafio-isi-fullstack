import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  icon: LucideIcon
  title: string
  subtitle: string
  // Ação principal da página (no máximo um botão preenchido por tela).
  action?: ReactNode
}

export function PageHeader({ icon: Icon, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="page-head">
      <div className="page-title">
        <span className="page-icon" aria-hidden="true">
          <Icon size={22} />
        </span>
        <div>
          <h1>{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  )
}
