import { Lock } from 'lucide-react'
import { useState } from 'react'
import { getLineup } from '../../api/lineups'
import { changeCondition } from '../../api/players'
import { CONDITIONS } from '../../api/types'
import type { Condition, Player } from '../../api/types'
import { Alert } from '../../components/Alert'
import { Avatar, ConditionBadge } from '../../components/Badges'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { useAction } from '../../hooks/useAction'
import { useRequest } from '../../hooks/useRequest'
import { POSITION_NAMES, conditionLabel, formatMoney } from '../../lib/format'

const DESCRIPTIONS: Record<Condition, string> = {
  APTO: 'Sem desconto por condição.',
  MAL_CONDICIONADO:
    'Desconto de 15%. Agilidade de 80 a 100 corta pela metade; de 1 a 30 soma 10 pontos.',
  DOENTE: 'Desconto de 30%, com o mesmo ajuste de agilidade.',
}

interface ConditionModalProps {
  player: Player
  // Nome do clube do jogador, usado no aviso de titular.
  clubName?: string
  onClose: () => void
  onSaved: () => void
}

// Troca a condição física. A regra "de Doente não passa direto para Apto" é
// da API; a tela só deixa a opção desabilitada e explica o motivo.
export function ConditionModal({ player, clubName, onClose, onSaved }: ConditionModalProps) {
  const [condition, setCondition] = useState<Condition>(player.condition)
  const { busy, run } = useAction()

  // O aviso de titular só existe para quem está em um clube.
  const lineup = useRequest(
    async () => (player.club_id === null ? undefined : getLineup(player.club_id)),
    `condition-lineup-${player.id}`,
  )
  const isStarter = lineup.data?.players.some((starter) => starter.id === player.id) ?? false
  const leavesLineup = isStarter && condition === 'DOENTE' && player.condition !== 'DOENTE'

  async function save() {
    const result = await run(
      () => changeCondition(player.id, condition),
      (updated) => ({
        title: 'Condição alterada',
        text: `${updated.name} agora está ${conditionLabel(updated.condition)}. Valor de mercado: ${formatMoney(updated.market_value)}.`,
      }),
    )
    if (result.ok) {
      onSaved()
    }
  }

  return (
    <Modal
      title="Alterar condição física"
      description="A condição muda o desconto do valor de mercado, recalculado ao salvar."
      onClose={onClose}
    >
      <div className="player-card">
        <Avatar name={player.name} />
        <div>
          <strong>{player.name}</strong>
          <span className="person-sub">
            {player.position} · {POSITION_NAMES[player.position]} · {player.age} anos
          </span>
        </div>
        <ConditionBadge condition={player.condition} />
      </div>

      <fieldset className="option-list">
        <legend className="sr-only">Condição física</legend>
        {CONDITIONS.map((option) => {
          const blocked = player.condition === 'DOENTE' && option === 'APTO'
          return (
            <label
              key={option}
              className={`option-card${condition === option ? ' option-selected' : ''}${blocked ? ' option-blocked' : ''}`}
            >
              <input
                type="radio"
                name="condition"
                value={option}
                checked={condition === option}
                disabled={blocked}
                onChange={() => setCondition(option)}
              />
              <span>
                <strong>
                  {conditionLabel(option)}
                  {player.condition === option && (
                    <span className="badge badge-outline">Atual</span>
                  )}
                </strong>
                <span className="option-desc">{DESCRIPTIONS[option]}</span>
                {blocked && (
                  <span className="option-desc">
                    <Lock size={12} aria-hidden="true" /> De Doente não passa direto para Apto.
                  </span>
                )}
              </span>
            </label>
          )
        })}
      </fieldset>

      {leavesLineup && (
        <Alert tone="warning" title={`${player.name} é titular`}>
          Ao passar a Doente, o jogador sai da escalação, e o {clubName ?? 'clube'} só volta a jogar
          partidas depois de escalar de novo os 5 titulares.
        </Alert>
      )}

      <div className="modal-actions">
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="primary"
          busy={busy}
          disabled={condition === player.condition}
          onClick={save}
        >
          Salvar condição
        </Button>
      </div>
    </Modal>
  )
}
