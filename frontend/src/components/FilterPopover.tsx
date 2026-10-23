import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface FilterPopoverProps {
  icon: ReactNode
  label: string
  // Resumo do que está escolhido ("Mal condicionado", "18 a 30"); vazio se nada.
  summary?: string
  disabled?: boolean
  // Explicação mostrada ao passar o mouse quando o filtro está desabilitado.
  disabledReason?: string
  children: ReactNode
}

// Botão que abre um painel com as opções de um filtro. Fecha com Esc ou ao
// clicar fora.
export function FilterPopover({
  icon,
  label,
  summary,
  disabled = false,
  disabledReason,
  children,
}: FilterPopoverProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  // Ao abrir, o foco vai para o primeiro campo do painel.
  useEffect(() => {
    if (open) {
      panel.current?.querySelector<HTMLElement>('button, input, select')?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }
    function closeOutside(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    document.addEventListener('mousedown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div className="filter-popover" ref={root}>
      <button
        ref={trigger}
        type="button"
        className={`filter-trigger${summary ? ' filter-trigger-on' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        title={disabled ? disabledReason : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        {icon}
        <span>{summary ? `${label}: ${summary}` : label}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <div
          className="filter-panel"
          ref={panel}
          id={panelId}
          role="group"
          aria-label={`Filtro de ${label}`}
        >
          {children}
        </div>
      )}
    </div>
  )
}
