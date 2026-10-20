import { useState } from 'react'
import { changeCondition } from '../../api/players'
import { CONDITIONS } from '../../api/types'
import type { Condition, Player } from '../../api/types'
import { Button } from '../../components/Button'
import { FormField } from '../../components/FormField'
import { Modal } from '../../components/Modal'
import { useAction } from '../../hooks/useAction'
import { conditionLabel } from '../../lib/format'

interface ConditionModalProps {
  player: Player
  onClose: () => void
  onSaved: () => void
}

// Troca a condição física. As regras (como não ir de DOENTE direto para APTO)
// são da API: se ela recusar, o motivo aparece como aviso e a janela fica aberta.
export function ConditionModal({ player, onClose, onSaved }: ConditionModalProps) {
  const [condition, setCondition] = useState<Condition>(player.condition)
  const { busy, run } = useAction()

  async function save() {
    const result = await run(
      () => changeCondition(player.id, condition),
      (updated) => `Condição de ${updated.name} alterada. Novo valor de mercado calculado.`,
    )
    if (result.ok) {
      onSaved()
    }
  }

  return (
    <Modal title={`Condição de ${player.name}`} onClose={onClose}>
      <FormField label="Condição física" htmlFor="condition">
        <select
          id="condition"
          value={condition}
          onChange={(event) => setCondition(event.target.value as Condition)}
        >
          {CONDITIONS.map((option) => (
            <option key={option} value={option}>
              {conditionLabel(option)}
            </option>
          ))}
        </select>
      </FormField>
      <div className="modal-actions">
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="primary" busy={busy} onClick={save}>
          Salvar
        </Button>
      </div>
    </Modal>
  )
}
