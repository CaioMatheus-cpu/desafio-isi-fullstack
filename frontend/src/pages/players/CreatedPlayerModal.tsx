import { CircleCheck, Eye } from 'lucide-react'
import type { Player } from '../../api/types'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { POSITION_NAMES, formatMoney } from '../../lib/format'

interface CreatedPlayerModalProps {
  player: Player
  onClose: () => void
  onDetails: () => void
}

// Mostra o que a API calculou ao cadastrar: valor base, valor de mercado e overall.
export function CreatedPlayerModal({ player, onClose, onDetails }: CreatedPlayerModalProps) {
  return (
    <Modal
      title="Jogador cadastrado"
      description={`${player.name} entrou livre e Apto. Valores em moedas, calculados pela API ao salvar.`}
      lead={
        <span className="success-mark" aria-hidden="true">
          <CircleCheck size={20} />
        </span>
      }
      onClose={onClose}
    >
      <dl className="result-list result-card">
        <div className="result-row result-highlight">
          <dt>
            Valor base
            <span className="option-desc">Calculado no cadastro; não muda depois</span>
          </dt>
          <dd>{formatMoney(player.base_value)}</dd>
        </div>
        <div className="result-row">
          <dt>
            Valor de mercado
            <span className="option-desc">Com condição, agilidade e idade</span>
          </dt>
          <dd>{formatMoney(player.market_value)}</dd>
        </div>
        <div className="result-row">
          <dt>
            Overall
            <span className="option-desc">
              Pelos pesos da posição {POSITION_NAMES[player.position]}
            </span>
          </dt>
          <dd>{player.overall}</dd>
        </div>
      </dl>
      <div className="modal-actions">
        <Button onClick={onDetails}>
          <Eye size={16} aria-hidden="true" /> Ver detalhes
        </Button>
        <Button variant="primary" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Modal>
  )
}
