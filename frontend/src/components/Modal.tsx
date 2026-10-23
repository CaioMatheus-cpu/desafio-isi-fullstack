import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { useDialogFocus } from '../hooks/useDialogFocus'

interface ModalProps {
  title: string
  // Frase de apoio logo abaixo do título.
  description?: string
  // Ícone ou marca acima do título (por exemplo, o ✓ de sucesso).
  lead?: ReactNode
  wide?: boolean
  onClose: () => void
  children: ReactNode
}

// Janela por cima da página, para formulários e confirmações. Fecha com Esc
// ou clicando fora dela.
export function Modal({ title, description, lead, wide = false, onClose, children }: ModalProps) {
  const titleId = useId()
  const dialog = useRef<HTMLDivElement>(null)
  useDialogFocus(dialog)

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div
      className="overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialog}
        tabIndex={-1}
        className={`modal${wide ? ' modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="icon-btn modal-close"
          aria-label="Fechar"
          onClick={onClose}
        >
          <X size={18} aria-hidden="true" />
        </button>
        {lead}
        <h2 id={titleId}>{title}</h2>
        {description && <p className="modal-desc">{description}</p>}
        {children}
      </div>
    </div>
  )
}
