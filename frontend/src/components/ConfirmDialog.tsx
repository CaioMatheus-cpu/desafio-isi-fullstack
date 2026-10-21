import type { ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  title: string
  confirmLabel: ReactNode
  description?: string
  busy: boolean
  onConfirm: () => void
  onCancel: () => void
  children: ReactNode
}

// Pergunta de confirmação antes de uma ação sem volta, como excluir ou vender.
export function ConfirmDialog({
  title,
  confirmLabel,
  description,
  busy,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} description={description} onClose={onCancel}>
      <div className="modal-body">{children}</div>
      <div className="modal-actions">
        <Button onClick={onCancel}>Cancelar</Button>
        <Button variant="danger" busy={busy} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
