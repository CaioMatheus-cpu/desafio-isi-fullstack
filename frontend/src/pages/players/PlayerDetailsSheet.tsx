import { ShoppingCart, SquarePen, HeartPulse, X } from 'lucide-react'
import { useEffect } from 'react'
import type { Club, Player } from '../../api/types'
import { Avatar, ConditionBadge, PositionBadge } from '../../components/Badges'
import { Button } from '../../components/Button'
import { formatMoney } from '../../lib/format'

interface PlayerDetailsSheetProps {
  player: Player
  club?: Club
  onClose: () => void
  onEdit: () => void
  onCondition: () => void
  onBuy: () => void
}

const ATTRIBUTES = [
  { key: 'pace', label: 'Velocidade' },
  { key: 'shooting', label: 'Finalização' },
  { key: 'passing', label: 'Passe' },
  { key: 'dribbling', label: 'Drible' },
  { key: 'defending', label: 'Defesa' },
  { key: 'physical', label: 'Físico' },
] as const

// Painel lateral com tudo que a API devolve sobre o jogador. Nada é calculado
// aqui: valor base, valor de mercado e overall vêm prontos.
export function PlayerDetailsSheet({
  player,
  club,
  onClose,
  onEdit,
  onCondition,
  onBuy,
}: PlayerDetailsSheetProps) {
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
      className="overlay overlay-sheet"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <aside
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${player.name}`}
      >
        <button
          type="button"
          className="icon-btn modal-close"
          aria-label="Fechar"
          onClick={onClose}
        >
          <X size={18} aria-hidden="true" />
        </button>

        <header className="sheet-head">
          <Avatar name={player.name} />
          <div>
            <h2>{player.name}</h2>
            <div className="sheet-badges">
              <PositionBadge position={player.position} />
              <ConditionBadge condition={player.condition} />
              <span className="badge badge-muted">{club ? club.name : 'Livre'}</span>
            </div>
          </div>
        </header>

        <div className="sheet-cards">
          <div className="stat">
            <span>Valor de mercado</span>
            <strong>{formatMoney(player.market_value)}</strong>
            <small>Calculado automaticamente</small>
          </div>
          <div className="stat">
            <span>Valor base</span>
            <strong>{formatMoney(player.base_value)}</strong>
            <small>Calculado no cadastro</small>
          </div>
          <div className="stat">
            <span>Overall</span>
            <strong>{player.overall}</strong>
            <small>Calculado pela posição</small>
          </div>
          <div className="stat">
            <span>Potencial</span>
            <strong>{player.potential}</strong>
            <small>Informado no cadastro</small>
          </div>
        </div>

        <div className="sheet-section">
          <h3>Indicadores técnicos</h3>
          <span className="muted">Escala de 1 a 99</span>
        </div>
        <ul className="bars">
          {ATTRIBUTES.map((attribute) => (
            <li key={attribute.key}>
              <span>{attribute.label}</span>
              <span className="bar-track" aria-hidden="true">
                <span className="bar-potential" style={{ width: `${player.potential}%` }} />
                <span className="bar-value" style={{ width: `${player[attribute.key]}%` }} />
              </span>
              <strong>{player[attribute.key]}</strong>
            </li>
          ))}
        </ul>
        <p className="muted bars-legend">
          Barra escura: valor do atributo. Barra clara: até o potencial ({player.potential}), que
          nenhum atributo passa.
        </p>

        <dl className="result-list sheet-facts">
          <div className="result-row">
            <dt>Idade</dt>
            <dd>{player.age} anos</dd>
          </div>
          <div className="result-row">
            <dt>Agilidade</dt>
            <dd>{player.agility}</dd>
          </div>
          <div className="result-row">
            <dt>Clube</dt>
            <dd>{club ? club.name : 'Livre'}</dd>
          </div>
        </dl>

        <footer className="sheet-actions">
          <Button onClick={onEdit}>
            <SquarePen size={16} aria-hidden="true" /> Editar
          </Button>
          <Button onClick={onCondition}>
            <HeartPulse size={16} aria-hidden="true" /> Alterar condição
          </Button>
          {player.club_id === null && (
            <Button variant="primary" onClick={onBuy}>
              <ShoppingCart size={16} aria-hidden="true" /> Comprar
            </Button>
          )}
        </footer>
      </aside>
    </div>
  )
}
