import { describe, expect, it } from 'vitest'
import {
  conditionLabel,
  formatDateParts,
  formatDateTime,
  formatMoney,
  formatSignedMoney,
  toApiDateTime,
} from './format'

describe('formatMoney', () => {
  it('usa 2 casas, vírgula decimal e ponto de milhar', () => {
    expect(formatMoney(1744.14)).toBe('1.744,14')
    expect(formatMoney(37)).toBe('37,00')
    expect(formatMoney(0)).toBe('0,00')
  })
})

describe('formatSignedMoney', () => {
  it('mostra o sinal da entrada e da saída de caixa', () => {
    expect(formatSignedMoney(35.7)).toBe('+35,70')
    expect(formatSignedMoney(-45.55)).toBe('-45,55')
  })

  it('não coloca sinal no zero', () => {
    expect(formatSignedMoney(0)).toBe('0,00')
  })
})

describe('datas da API', () => {
  it('reescreve a data sem passar pelo fuso do navegador', () => {
    expect(formatDateTime('2026-11-07T10:30:00-03:00')).toBe('07/11/2026 10:30')
  })

  it('separa a data e a hora', () => {
    expect(formatDateParts('2027-11-12T15:00:00-03:00')).toEqual({
      date: '12/11/2027',
      time: '15:00',
    })
  })

  it('devolve o texto original quando não é uma data da API', () => {
    expect(formatDateTime('amanhã')).toBe('amanhã')
  })

  it('acrescenta o fuso de Brasília ao que foi digitado', () => {
    expect(toApiDateTime('2027-11-12T15:00')).toBe('2027-11-12T15:00-03:00')
  })
})

describe('conditionLabel', () => {
  it('traduz as condições', () => {
    expect(conditionLabel('APTO')).toBe('Apto')
    expect(conditionLabel('MAL_CONDICIONADO')).toBe('Mal condicionado')
    expect(conditionLabel('DOENTE')).toBe('Doente')
  })
})
