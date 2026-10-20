import type { Condition } from '../api/types'

// Moeda fictícia da liga: sempre 2 casas, com vírgula decimal (37,00).
const money = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(value: number): string {
  return money.format(value)
}

// Variação de caixa com sinal: "+35,70" para entrada e "-38,85" para saída.
export function formatSignedMoney(value: number): string {
  return value > 0 ? `+${money.format(value)}` : money.format(value)
}

// A API devolve as datas como AAAA-MM-DDTHH:MM:SS-03:00, já no horário de
// Brasília. Aqui só reescrevo os pedaços (DD/MM/AAAA HH:MM), sem passar pelo
// fuso do navegador, para a data nunca mudar de acordo com onde o usuário está.
const API_DATE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/

export function formatDateTime(apiDate: string): string {
  const match = API_DATE.exec(apiDate)
  if (!match) {
    return apiDate
  }
  const [, year, month, day, hour, minute] = match
  return `${day}/${month}/${year} ${hour}:${minute}`
}

// O campo de data e hora do navegador devolve AAAA-MM-DDTHH:MM. O horário
// digitado é o de Brasília, então basta acrescentar o fuso que a API exige.
export function toApiDateTime(localValue: string): string {
  return `${localValue}-03:00`
}

const CONDITION_LABELS: Record<Condition, string> = {
  APTO: 'Apto',
  MAL_CONDICIONADO: 'Mal condicionado',
  DOENTE: 'Doente',
}

export function conditionLabel(condition: Condition): string {
  return CONDITION_LABELS[condition]
}
