import { Check, CircleAlert, Lock, Swords, TriangleAlert, Plus } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { saveLineup } from '../../api/lineups'
import { FORMATIONS } from '../../api/types'
import type { Formation, Lineup, SquadPlayer } from '../../api/types'
import { Avatar, ConditionBadge } from '../../components/Badges'
import { Button } from '../../components/Button'
import { useNotice } from '../../hooks/notice-context'
import { messageOf } from '../../lib/errors'
import { POSITION_NAMES } from '../../lib/format'
import { formationGroups } from '../../lib/match-view'
import {
  FORMATION_HINTS,
  FORMATION_SLOTS,
  SLOT_COUNT,
  assignStarters,
  usedAttributes,
} from './lineup-slots'

interface LineupTabProps {
  clubId: number
  clubName: string
  squad: SquadPlayer[]
  lineup: Lineup | undefined
  error: string | undefined
  // Relê a escalação da API (depois de salvar).
  onSaved: () => void
}

function surname(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts[parts.length - 1] ?? name
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : ''
  return ((parts[0]?.charAt(0) ?? '') + last).toUpperCase()
}

// Mini campo de cada cartão de formação: uma bolinha por jogador.
function FormationIcon({ formation }: { formation: Formation }) {
  const groups = formationGroups(formation)
  const rows = [groups.attack, groups.midfield, groups.defense].filter((count) => count > 0)
  return (
    <svg className="formation-icon" viewBox="0 0 28 36" aria-hidden="true">
      <rect width="28" height="36" rx="4" fill="#0f6b35" />
      {rows.map((count, rowIndex) =>
        Array.from({ length: count }, (_, dot) => (
          <circle
            key={`${rowIndex}-${dot}`}
            cx={((dot + 1) * 28) / (count + 1)}
            cy={6 + rowIndex * 8}
            r="2"
            fill="#fff"
          />
        )),
      )}
      <circle cx="14" cy="30" r="2" fill="#fff" />
    </svg>
  )
}

const ROW_Y = { attack: 18, midfield: 42, defense: 66, goalkeeper: 88 }
const ROW_X: Record<number, number[]> = { 1: [50], 2: [28, 72], 3: [20, 50, 80] }

// Prévia vertical: ataque em cima, goleiro embaixo. Vaga vazia aparece tracejada.
function LineupPitch({
  formation,
  starters,
}: {
  formation: Formation | ''
  starters: (SquadPlayer | undefined)[]
}) {
  if (formation === '') {
    return <div className="mini-pitch mini-pitch-empty muted">Escolha a formação</div>
  }
  const groups = formationGroups(formation)
  const rows: { y: number; label: string; slots: number[] }[] = []
  let next = 1
  const take = (count: number) => Array.from({ length: count }, () => next++)
  const defense = take(groups.defense)
  const midfield = take(groups.midfield)
  const attack = take(groups.attack)
  rows.push({ y: ROW_Y.attack, label: 'Ataque', slots: attack })
  if (midfield.length > 0) {
    rows.push({ y: ROW_Y.midfield, label: 'Meio', slots: midfield })
  }
  rows.push({ y: ROW_Y.defense, label: 'Defesa', slots: defense })
  rows.push({ y: ROW_Y.goalkeeper, label: 'Goleiro', slots: [0] })

  return (
    <div className="mini-pitch" role="img" aria-label={`Prévia da formação ${formation}`}>
      <span className="mini-half" />
      <span className="mini-circle" />
      <span className="mini-area" />
      {rows.flatMap((row) =>
        row.slots.map((slot, position) => {
          const player = starters[slot]
          const x = ROW_X[row.slots.length]?.[position] ?? 50
          return (
            <span key={slot} className="mini-spot" style={{ left: `${x}%`, top: `${row.y}%` }}>
              {player ? (
                <>
                  <span className="pitch-token pitch-token-home">
                    {initials(player.name)}
                    {player.condition === 'MAL_CONDICIONADO' && (
                      <span className="pitch-flag pitch-flag-weak">
                        <TriangleAlert size={9} aria-hidden="true" />
                      </span>
                    )}
                  </span>
                  <span className="mini-label">{surname(player.name)}</span>
                </>
              ) : (
                <>
                  <span className="mini-empty">
                    <Plus size={12} aria-hidden="true" />
                  </span>
                  <span className="mini-label">{row.label}</span>
                </>
              )}
            </span>
          )
        }),
      )}
    </div>
  )
}

function joinNames(names: string[]): string {
  if (names.length <= 1) {
    return names.join('')
  }
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}

export function LineupTab({ clubId, clubName, squad, lineup, error, onSaved }: LineupTabProps) {
  if (error) {
    return (
      <div className="alert alert-error" role="alert">
        <CircleAlert size={18} aria-hidden="true" />
        <div>
          <strong>Não foi possível carregar a escalação</strong>
          <p>{error}</p>
        </div>
      </div>
    )
  }
  if (!lineup) {
    return (
      <div className="state-box" role="status" aria-busy="true">
        <div className="skeleton" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="muted">Carregando...</p>
      </div>
    )
  }

  const starters = lineup.players.length
  const incompleteReason =
    squad.length < 5
      ? `O elenco tem ${squad.length} ${squad.length === 1 ? 'jogador' : 'jogadores'}, e a escalação precisa de 5: 1 goleiro e 4 jogadores de linha. Compre jogadores e salve a escalação com os 5 titulares.`
      : lineup.formation
        ? `A ${lineup.formation} continua salva, com ${starters} ${starters === 1 ? 'titular' : 'titulares'}. Escale de novo os 5 titulares para o clube voltar a jogar.`
        : 'Escolha a formação e um titular para cada vaga, e salve a escalação com os 5 titulares.'

  return (
    <>
      {!lineup.complete && (
        <div className="callout callout-warning" role="alert">
          <TriangleAlert size={18} aria-hidden="true" />
          <div>
            <strong>Escalação incompleta: o {clubName} não pode jogar partidas</strong>
            <p>{incompleteReason}</p>
          </div>
        </div>
      )}
      <LineupForm
        // Recria o formulário quando a escalação salva muda, para ele abrir já
        // preenchido com os titulares atuais.
        key={`${lineup.formation}-${lineup.players.map((player) => player.id).join(',')}-${squad.length}`}
        clubId={clubId}
        clubName={clubName}
        squad={squad}
        lineup={lineup}
        onSaved={onSaved}
      />
    </>
  )
}

interface LineupFormProps {
  clubId: number
  clubName: string
  squad: SquadPlayer[]
  lineup: Lineup
  onSaved: () => void
}

// Escolha da formação e de um titular para cada uma das 5 vagas. Só entram nas
// opções jogadores do elenco que não estão doentes e que ainda não foram
// escolhidos em outra vaga. As demais regras são conferidas pela API.
function LineupForm({ clubId, clubName, squad, lineup, onSaved }: LineupFormProps) {
  const { notify } = useNotice()
  const initialSlots = useMemo(
    () => assignStarters(lineup.formation, lineup.players),
    [lineup.formation, lineup.players],
  )
  const [formation, setFormation] = useState<Formation | ''>(lineup.formation ?? '')
  const [slots, setSlots] = useState<string[]>(initialSlots)
  const [refusal, setRefusal] = useState<string>()
  const [busy, setBusy] = useState(false)
  const running = useRef(false)

  const slotDefs = formation ? FORMATION_SLOTS[formation] : []
  const byId = new Map(squad.map((player) => [String(player.id), player]))
  const chosen = slots.map((id) => byId.get(id))
  const complete = formation !== '' && slots.every((id) => id !== '')
  const weakened = chosen.filter(
    (player): player is SquadPlayer => player?.condition === 'MAL_CONDICIONADO',
  )
  const reserves = squad.filter((player) => !slots.includes(String(player.id)))

  function chooseFormation(next: Formation) {
    setFormation(next)
    setSlots(Array<string>(SLOT_COUNT).fill(''))
    setRefusal(undefined)
  }

  function chooseStarter(index: number, id: string) {
    setSlots((current) => current.map((value, position) => (position === index ? id : value)))
  }

  function reset() {
    setFormation(lineup.formation ?? '')
    setSlots(initialSlots)
    setRefusal(undefined)
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (formation === '' || !complete || running.current) {
      return
    }
    running.current = true
    setBusy(true)
    setRefusal(undefined)
    try {
      const saved = await saveLineup(clubId, formation, slots.map(Number))
      notify(
        'success',
        `${clubName} na ${saved.formation ?? formation}, com os 5 titulares devolvidos pela API.`,
        'Escalação salva',
      )
      onSaved()
    } catch (error) {
      setRefusal(messageOf(error))
    } finally {
      running.current = false
      setBusy(false)
    }
  }

  return (
    <form noValidate onSubmit={save} className="lineup-layout">
      <section className="card lineup-main">
        <header className="card-head">
          <div>
            <h2>Titulares</h2>
            <p className="muted">
              1 goleiro e 4 jogadores de linha, na formação escolhida. Salvar troca os 5 de uma vez.
            </p>
          </div>
          {lineup.complete ? (
            <span className="badge badge-success">
              <Check size={12} aria-hidden="true" /> Completa
            </span>
          ) : (
            <span className="badge badge-warning">
              <TriangleAlert size={12} aria-hidden="true" /> Incompleta
            </span>
          )}
        </header>

        {refusal && (
          <div className="alert alert-error lineup-alert" role="alert">
            <CircleAlert size={18} aria-hidden="true" />
            <div>
              <strong>A escalação foi recusada</strong>
              <p>{refusal}</p>
            </div>
          </div>
        )}

        <fieldset className="formation-set">
          <legend>Formação</legend>
          <p className="muted">
            Os números contam os jogadores de linha de trás para frente. O goleiro fica fora da
            conta.
          </p>
          <div className="formation-cards">
            {FORMATIONS.map((option) => (
              <label
                key={option}
                className={`formation-card${formation === option ? ' formation-selected' : ''}`}
              >
                <FormationIcon formation={option} />
                <span>
                  <span className="formation-name">
                    <input
                      type="radio"
                      name="formation"
                      value={option}
                      checked={formation === option}
                      onChange={() => chooseFormation(option)}
                    />
                    {option}
                  </span>
                  <span className="option-desc">{FORMATION_HINTS[option]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="table-wrap table-flat">
          <table>
            <caption className="sr-only">Titulares por vaga</caption>
            <thead>
              <tr>
                <th>Vaga</th>
                <th>Titular</th>
                <th>Condição</th>
                <th className="num">Overall</th>
                <th>Atributos usados</th>
              </tr>
            </thead>
            <tbody>
              {slotDefs.length === 0 && (
                <tr>
                  <td colSpan={5} className="muted">
                    Escolha uma formação para ver as vagas.
                  </td>
                </tr>
              )}
              {slotDefs.map((slot, index) => {
                const options = squad.filter(
                  (player) =>
                    slot.positions.includes(player.position) &&
                    player.condition !== 'DOENTE' &&
                    (slots[index] === String(player.id) || !slots.includes(String(player.id))),
                )
                const player = chosen[index]
                const empty =
                  slot.positions.length > 1
                    ? `Sem ${slot.positions.join(' ou ')}`
                    : `Sem ${slot.positions[0]} no elenco`
                return (
                  <tr key={`${formation}-${index}`}>
                    <td>
                      <strong>{slot.title}</strong>
                      <span className="person-sub">{slot.sub}</span>
                    </td>
                    <td>
                      <select
                        aria-label={`Titular da vaga ${index + 1}: ${slot.title} (${slot.sub})`}
                        value={slots[index]}
                        disabled={options.length === 0}
                        onChange={(event) => chooseStarter(index, event.target.value)}
                      >
                        <option value="">
                          {options.length === 0 ? empty : 'Escolha o titular'}
                        </option>
                        {options.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name} ({option.position})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{player && <ConditionBadge condition={player.condition} />}</td>
                    <td className="num">{player && <strong>{player.overall}</strong>}</td>
                    <td>
                      {player &&
                        usedAttributes(index, player).map((attribute) => (
                          <span key={attribute.label} className="used-attribute">
                            <span className="muted">{attribute.label}</span>{' '}
                            <strong>{attribute.value}</strong>
                          </span>
                        ))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {weakened.length > 0 && (
          <div className="callout callout-warning lineup-alert" role="status">
            <TriangleAlert size={18} aria-hidden="true" />
            <div>
              <strong>
                {joinNames(weakened.map((player) => player.name))}{' '}
                {weakened.length === 1 ? 'está mal condicionado' : 'estão mal condicionados'}
              </strong>
              <p>
                {weakened.length === 1 ? 'Pode jogar' : 'Podem jogar'}, mas cada atributo vale 15% a
                menos durante a partida.
              </p>
            </div>
          </div>
        )}

        <footer className="lineup-foot">
          <p className="muted">
            {complete
              ? 'A escalação vale até ser trocada. Titular vendido ou que fica doente sai dela, e o clube só volta a jogar depois de escalar de novo.'
              : 'Escolha a formação e um titular para cada vaga para salvar.'}
          </p>
          <div className="modal-actions">
            <Button onClick={reset} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" busy={busy} disabled={!complete}>
              <Check size={16} aria-hidden="true" /> Salvar escalação
            </Button>
          </div>
        </footer>
      </section>

      <aside className="lineup-side">
        <section className="card">
          <header className="card-head">
            <div>
              <h2>Em campo</h2>
              <p className="muted">
                {formation
                  ? `Prévia da formação ${formation}, do goleiro ao ataque.`
                  : 'Escolha uma formação para ver a prévia.'}
              </p>
            </div>
          </header>
          <div className="card-body">
            <LineupPitch formation={formation} starters={chosen} />
          </div>
          <p className="card-foot muted lineup-explain">
            <Swords size={14} aria-hidden="true" /> Na partida, atacam os 3 jogadores de linha mais
            avançados e defendem o goleiro e os 2 mais recuados. É gol quando o ataque é maior que a
            defesa.
          </p>
        </section>

        <section className="card">
          <header className="card-head">
            <div>
              <h2>Reservas</h2>
              <p className="muted">Jogadores do elenco fora da escalação.</p>
            </div>
          </header>
          <div className="card-body reserves">
            {reserves.length === 0 && (
              <p className="muted">
                Nenhuma reserva:{' '}
                {squad.length === 1
                  ? 'o jogador do elenco está escolhido'
                  : `os ${squad.length} jogadores do elenco estão escolhidos`}
                .
              </p>
            )}
            {reserves.map((player) => (
              <div key={player.id} className="reserve">
                <Avatar name={player.name} />
                <div>
                  <strong>{player.name}</strong>
                  <span className="person-sub">{POSITION_NAMES[player.position]}</span>
                </div>
                <ConditionBadge condition={player.condition} />
                {player.condition === 'DOENTE' && (
                  <p className="reserve-note muted">
                    <Lock size={12} aria-hidden="true" /> Doente não pode ser escalado.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      </aside>
    </form>
  )
}
