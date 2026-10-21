import type { Condition, Position } from '../api/types'
import { conditionLabel } from '../lib/format'

const CONDITION_TONE: Record<Condition, string> = {
  APTO: 'success',
  MAL_CONDICIONADO: 'warning',
  DOENTE: 'destructive',
}

// O status nunca depende só da cor: o selo sempre traz ponto e texto.
export function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <span className={`badge badge-${CONDITION_TONE[condition]}`}>
      <span className="badge-dot" aria-hidden="true" />
      {conditionLabel(condition)}
    </span>
  )
}

export function PositionBadge({ position }: { position: Position }) {
  return <span className="badge badge-outline">{position}</span>
}

const AVATAR_TONES = ['violet', 'pink', 'cyan', 'teal', 'zinc']

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : ''
  return (first + last).toUpperCase()
}

// A cor do avatar é só decoração: vem do próprio nome, então não muda entre
// consultas.
export function Avatar({ name }: { name: string }) {
  let sum = 0
  for (const char of name) {
    sum += char.charCodeAt(0)
  }
  const tone = AVATAR_TONES[sum % AVATAR_TONES.length]
  return (
    <span className={`avatar avatar-${tone}`} aria-hidden="true">
      {initials(name)}
    </span>
  )
}

// Barra de agilidade (0 a 100). O número continua escrito ao lado.
export function AgilityBar({ value }: { value: number }) {
  const tone = value >= 75 ? 'good' : value < 30 ? 'bad' : 'mid'
  return (
    <span className="agility">
      <span className="agility-value">{value}</span>
      <span className="agility-track" aria-hidden="true">
        <span className={`agility-fill agility-${tone}`} style={{ width: `${value}%` }} />
      </span>
    </span>
  )
}
