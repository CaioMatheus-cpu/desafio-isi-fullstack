import {
  CircleAlert,
  CircleCheck,
  HandCoins,
  History,
  Info,
  LoaderCircle,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { ApiError } from '../../api/client'
import { sellPlayer } from '../../api/market'
import type { SaleResult, SquadPlayer } from '../../api/types'
import { Avatar } from '../../components/Badges'
import { Button } from '../../components/Button'
import { Modal } from '../../components/Modal'
import { ResultCard } from '../../components/ResultCard'
import { messageOf } from '../../lib/errors'
import { POSITION_NAMES, formatDateTime, formatMoney, formatSignedMoney } from '../../lib/format'
import { PenaltyChip } from './PenaltyChip'

interface SellDialogProps {
  player: SquadPlayer
  clubName: string
  // O jogador é titular? Se for, a venda também o tira da escalação.
  isStarter: boolean
  onClose: () => void
  // Chamado quando a venda é feita, para a página do clube se atualizar.
  onSold: () => void
  onViewHistory: () => void
}

interface Failure {
  title: string
  text: string
  network: boolean
}

const STATUS_TONE: Record<string, string> = {
  RESCINDIDO: 'warning',
  ENCERRADO: 'muted',
}

// Venda de um jogador do clube: confirma, mostra o resultado calculado pela API
// e deixa o caminho para o histórico. Multa, lucro, comissão e crédito não são
// calculados aqui.
export function SellDialog({
  player,
  clubName,
  isStarter,
  onClose,
  onSold,
  onViewHistory,
}: SellDialogProps) {
  const [failure, setFailure] = useState<Failure>()
  const [sale, setSale] = useState<SaleResult>()
  const [busy, setBusy] = useState(false)
  const running = useRef(false)

  async function confirm() {
    if (running.current) {
      return
    }
    running.current = true
    setBusy(true)
    setFailure(undefined)
    try {
      const done = await sellPlayer(player.id)
      setSale(done)
      onSold()
    } catch (error) {
      if (error instanceof ApiError && error.status === 0) {
        setFailure({
          title: 'Sem conexão',
          text: 'A venda não foi confirmada. Verifique a conexão e tente de novo.',
          network: true,
        })
      } else {
        setFailure({ title: 'A venda foi recusada', text: messageOf(error), network: false })
      }
    } finally {
      running.current = false
      setBusy(false)
    }
  }

  if (sale) {
    const noPenalty = sale.remaining_days === 0
    const description = noPenalty
      ? `${sale.player_name} voltou a ficar livre. A fidelidade já tinha terminado, então não houve multa.`
      : isStarter
        ? `${sale.player_name} voltou a ficar livre e saiu da escalação.`
        : `${sale.player_name} voltou a ficar livre.`
    const tone = STATUS_TONE[sale.contract_status] ?? 'muted'
    return (
      <Modal
        title="Venda concluída"
        description={description}
        lead={
          <span className="success-mark" aria-hidden="true">
            <CircleCheck size={20} />
          </span>
        }
        onClose={onClose}
      >
        <ResultCard
          items={[
            { label: 'Valor de compra', value: formatMoney(sale.purchase_value) },
            {
              label: 'Valor de venda',
              sub: 'Valor de mercado no momento da venda',
              value: formatMoney(sale.value),
            },
            { label: 'Dias restantes', value: sale.remaining_days },
            {
              label: 'Multa',
              sub: noPenalty
                ? 'Fidelidade cumprida: sem multa'
                : `${sale.penalty_rate}% do valor de venda, com teto de 10,00`,
              value: formatMoney(sale.penalty),
            },
            {
              label: 'Lucro',
              value: (
                <span
                  className={
                    sale.profit > 0 ? 'tone-positive' : sale.profit < 0 ? 'tone-negative' : ''
                  }
                >
                  {formatSignedMoney(sale.profit)}
                </span>
              ),
            },
            {
              label: 'Comissão',
              sub:
                sale.profit > 0
                  ? '10% do lucro até 10,00 + 20% do que passar'
                  : 'Sem lucro: sem comissão',
              value: formatMoney(sale.fee),
            },
            {
              label: 'Crédito no caixa',
              sub: 'Valor de venda – multa – comissão',
              value: formatSignedMoney(sale.cash_change),
              highlight: true,
            },
            {
              label: 'Contrato',
              value: <span className={`badge badge-${tone}`}>{sale.contract_status}</span>,
            },
            {
              label: `Novo caixa do ${clubName}`,
              value: formatMoney(sale.club_cash),
              highlight: true,
            },
          ]}
        />
        <div className="modal-actions">
          <Button
            onClick={() => {
              onClose()
              onViewHistory()
            }}
          >
            <History size={16} aria-hidden="true" /> Ver histórico
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
      title={`Vender ${player.name}?`}
      description={`O jogador sai do elenco do ${clubName} e volta a ficar livre.`}
      onClose={onClose}
    >
      {failure && (
        <div className="alert alert-error" role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <div>
            <strong>{failure.title}</strong>
            <p>{failure.text}</p>
          </div>
        </div>
      )}
      {isStarter && (
        <div className="callout callout-warning" role="status">
          <TriangleAlert size={18} aria-hidden="true" />
          <div>
            <strong>{player.name} é titular</strong>
            <p>
              Ao vender, o jogador sai da escalação, e o {clubName} só volta a jogar partidas depois
              de escalar de novo os 5 titulares.
            </p>
          </div>
        </div>
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

      {player.contract && (
        <dl className="result-list result-card">
          <div className="result-row">
            <dt>Valor de compra</dt>
            <dd>{formatMoney(player.contract.purchase_value)}</dd>
          </div>
          <div className="result-row">
            <dt>Fim da fidelidade</dt>
            <dd>{formatDateTime(player.contract.loyalty_until).replace(' ', ', ')}</dd>
          </div>
          <div className="result-row">
            <dt>Dias restantes</dt>
            <dd>{player.contract.remaining_days}</dd>
          </div>
          <div className="result-row">
            <dt>% de multa se vender agora</dt>
            <dd>
              <PenaltyChip rate={player.contract.penalty_rate} />
            </dd>
          </div>
        </dl>
      )}

      <div className="info-box info-row">
        <Info size={14} aria-hidden="true" />
        <p>
          A venda é pelo valor de mercado do momento. Multa (teto de 10,00), lucro, comissão e
          crédito são calculados ao confirmar.
        </p>
      </div>
      {busy && (
        <div className="info-box info-row">
          <Info size={14} aria-hidden="true" />
          <p>Enviando a venda. Os botões ficam desabilitados até a resposta.</p>
        </div>
      )}

      <div className="modal-actions">
        <Button onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button variant="primary" disabled={busy} onClick={confirm}>
          {busy ? (
            <>
              <LoaderCircle size={16} className="spin" aria-hidden="true" /> Vendendo...
            </>
          ) : failure?.network ? (
            <>
              <RefreshCw size={16} aria-hidden="true" /> Tentar de novo
            </>
          ) : (
            <>
              <HandCoins size={16} aria-hidden="true" /> Confirmar venda
            </>
          )}
        </Button>
      </div>
    </Modal>
  )
}
