import {
  ArrowRight,
  Calendar,
  CircleCheck,
  Clock,
  Info,
  LoaderCircle,
  RefreshCw,
  Shield,
  ShoppingCart,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { listClubs } from '../../api/clubs'
import { buyPlayer } from '../../api/market'
import type { Player, PurchaseResult } from '../../api/types'
import { Alert } from '../../components/Alert'
import { Avatar } from '../../components/Badges'
import { Button } from '../../components/Button'
import { FormField } from '../../components/FormField'
import { Modal } from '../../components/Modal'
import { useRequest } from '../../hooks/useRequest'
import { messageOf } from '../../lib/errors'
import { POSITION_NAMES, formatDateTime, formatMoney, toApiDateTime } from '../../lib/format'

interface BuyPlayerModalProps {
  player: Player
  onClose: () => void
  // Chamado assim que a compra é feita, para a lista atrás da janela se atualizar.
  onBought: () => void
}

// Sugestão inicial: daqui a um ano, às 15:00. A pessoa pode trocar.
function defaultLoyaltyDate(): string {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

interface Failure {
  title: string
  text: string
  network: boolean
}

function FeeRow({ fee }: { fee: number }) {
  return (
    <div className="result-row">
      <dt>
        Taxa
        <span className="option-desc">
          {fee > 0 ? `5% do valor, porque passa de 30,00` : 'Sem taxa: o valor não passa de 30,00'}
        </span>
      </dt>
      <dd>{formatMoney(fee)}</dd>
    </div>
  )
}

// Compra de um jogador livre: escolhe o clube e o fim da fidelidade, confirma
// e vê o resultado. O preço, a taxa e o caixa novo vêm da API; a tela só soma
// o valor com a taxa para mostrar o custo total.
export function BuyPlayerModal({ player, onClose, onBought }: BuyPlayerModalProps) {
  const navigate = useNavigate()
  const clubs = useRequest(() => listClubs(), 'buy-clubs')
  const [clubId, setClubId] = useState('')
  const [date, setDate] = useState(defaultLoyaltyDate)
  const [time, setTime] = useState('15:00')
  const [errors, setErrors] = useState<{ club?: string; date?: string }>({})
  const [failure, setFailure] = useState<Failure>()
  const [purchase, setPurchase] = useState<PurchaseResult>()
  const [busy, setBusy] = useState(false)
  const running = useRef(false)

  const selectedClub = clubs.data?.find((club) => String(club.id) === clubId)

  async function confirm(event: React.FormEvent) {
    event.preventDefault()
    const found: { club?: string; date?: string } = {}
    if (clubId === '') {
      found.club = 'Escolha o clube comprador.'
    }
    if (date === '' || time === '') {
      found.date = 'Informe o fim da fidelidade.'
    }
    setErrors(found)
    setFailure(undefined)
    if (found.club || found.date || running.current) {
      return
    }

    running.current = true
    setBusy(true)
    try {
      const done = await buyPlayer(player.id, {
        club_id: Number(clubId),
        loyalty_until: toApiDateTime(`${date}T${time}`),
      })
      setPurchase(done)
      onBought()
    } catch (error) {
      if (error instanceof ApiError && error.status === 0) {
        setFailure({
          title: 'Sem conexão',
          text: 'A compra não foi confirmada. Verifique a conexão e tente de novo.',
          network: true,
        })
      } else {
        setFailure({ title: 'Compra recusada', text: messageOf(error), network: false })
      }
    } finally {
      running.current = false
      setBusy(false)
    }
  }

  if (purchase) {
    const totalCost = Math.round((purchase.value + purchase.fee) * 100) / 100
    const clubName = clubs.data?.find((club) => club.id === purchase.club_id)?.name ?? 'o clube'
    const loyalty = formatDateTime(purchase.contract.loyalty_until).replace(' ', ', ')
    return (
      <Modal
        title="Compra concluída"
        description={`${purchase.player_name} agora é do ${clubName}.`}
        lead={
          <span className="success-mark" aria-hidden="true">
            <CircleCheck size={20} />
          </span>
        }
        onClose={onClose}
      >
        <dl className="result-list result-card">
          <div className="result-row">
            <dt>
              Valor
              <span className="option-desc">Valor de mercado no momento da compra</span>
            </dt>
            <dd>{formatMoney(purchase.value)}</dd>
          </div>
          <FeeRow fee={purchase.fee} />
          <div className="result-row result-highlight">
            <dt>
              <strong>Custo total</strong>
              <span className="option-desc">Valor + taxa</span>
            </dt>
            <dd>
              <strong>{formatMoney(totalCost)}</strong>
            </dd>
          </div>
          <div className="result-row">
            <dt>Fim da fidelidade</dt>
            <dd>{loyalty}</dd>
          </div>
          <div className="result-row">
            <dt>Contrato</dt>
            <dd>
              <span className="badge badge-success">
                <span className="badge-dot" aria-hidden="true" />
                {purchase.contract.status}
              </span>
            </dd>
          </div>
          <div className="result-row result-highlight">
            <dt>
              <strong>Novo caixa do {clubName}</strong>
            </dt>
            <dd>
              <strong>{formatMoney(purchase.club_cash)}</strong>
            </dd>
          </div>
        </dl>
        <div className="modal-actions">
          <Button
            onClick={() => {
              onClose()
              navigate(`/clubes/${purchase.club_id}`)
            }}
          >
            Ver clube <ArrowRight size={16} aria-hidden="true" />
          </Button>
          <Button variant="primary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      title="Comprar jogador"
      description="Escolha o clube comprador e até quando vai a fidelidade do contrato."
      onClose={onClose}
    >
      <form noValidate onSubmit={confirm}>
        {failure && (
          <Alert tone="error" title={failure.title}>
            {failure.text}
          </Alert>
        )}

        <div className="player-card player-card-value">
          <Avatar name={player.name} />
          <div>
            <strong>{player.name}</strong>
            <span className="person-sub">
              {player.position} · {POSITION_NAMES[player.position]} · {player.age} anos
            </span>
          </div>
          <div className="player-card-price">
            <span className="muted">Valor de mercado</span>
            <strong>{formatMoney(player.market_value)}</strong>
          </div>
        </div>

        <FormField
          label="Clube comprador"
          htmlFor="buy-club"
          error={errors.club}
          hint={
            selectedClub
              ? `Caixa atual: ${formatMoney(selectedClub.cash)}. O custo total (valor + taxa) pode ir até 50% do caixa.`
              : 'O custo total (valor + taxa) pode ir até 50% do caixa.'
          }
        >
          <div className="select-icon">
            <Shield size={16} aria-hidden="true" />
            <select
              id="buy-club"
              value={clubId}
              onChange={(event) => setClubId(event.target.value)}
            >
              <option value="">
                {clubs.loading ? 'Carregando...' : 'Escolha o clube comprador'}
              </option>
              {(clubs.data ?? []).map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name} ({club.acronym}) · caixa {formatMoney(club.cash)}
                </option>
              ))}
            </select>
          </div>
        </FormField>

        <div className="field">
          <span className="field-label">Fim da fidelidade</span>
          <div className="date-row">
            <div className="select-icon">
              <Calendar size={16} aria-hidden="true" />
              <input
                id="buy-date"
                type="date"
                aria-label="Data do fim da fidelidade"
                aria-invalid={errors.date ? true : undefined}
                aria-describedby="buy-date-note"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className="select-icon">
              <Clock size={16} aria-hidden="true" />
              <input
                id="buy-time"
                type="time"
                aria-label="Hora do fim da fidelidade"
                aria-invalid={errors.date ? true : undefined}
                aria-describedby="buy-date-note"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </div>
          </div>
          {errors.date ? (
            <p className="field-error" id="buy-date-note" role="alert">
              {errors.date}
            </p>
          ) : (
            <p className="field-hint" id="buy-date-note">
              Depois do momento da compra e até 1.095 dias. Horário de Brasília; enviado com o fuso
              (-03:00).
            </p>
          )}
        </div>

        <div className="info-box info-row">
          <Info size={14} aria-hidden="true" />
          <p>
            A taxa é de 5% do valor de mercado, só quando ele passa de 30,00. Taxa, custo e novo
            caixa são calculados ao confirmar.
          </p>
        </div>
        {busy && (
          <div className="info-box info-row">
            <Info size={14} aria-hidden="true" />
            <p>Enviando a compra. Os botões ficam desabilitados até a resposta.</p>
          </div>
        )}

        <div className="modal-actions">
          <Button onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? (
              <>
                <LoaderCircle size={16} className="spin" aria-hidden="true" /> Comprando...
              </>
            ) : failure?.network ? (
              <>
                <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
              </>
            ) : (
              <>
                <ShoppingCart size={16} aria-hidden="true" /> Confirmar compra
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
