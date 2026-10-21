import type { ReactNode } from 'react'

interface Tab<T extends string> {
  id: T
  label: string
  icon?: ReactNode
  // Quantidade mostrada ao lado do nome da aba.
  count?: number
}

interface TabsProps<T extends string> {
  tabs: Tab<T>[]
  active: T
  onChange: (id: T) => void
  // 'line' (sublinhado) para páginas; 'pill' (cápsula) para filtros de lista.
  variant?: 'line' | 'pill'
}

// Abas para dividir uma página (por exemplo, a página do clube).
export function Tabs<T extends string>({ tabs, active, onChange, variant = 'line' }: TabsProps<T>) {
  return (
    <div className={`tabs tabs-${variant}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === active}
          className={`tab${tab.id === active ? ' tab-active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
        </button>
      ))}
    </div>
  )
}
