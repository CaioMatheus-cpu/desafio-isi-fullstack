import {
  loyaltyWindowError,
  penaltyRatePercent,
  remainingDays,
} from './loyalty';

const NOW = new Date('2026-11-05T19:40:00.000Z');
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const after = (ms: number) => new Date(NOW.getTime() + ms);

describe('remainingDays', () => {
  // Tabela da RN15 do enunciado.
  it.each<[string, number, number]>([
    ['10 dias e 2 horas', 10 * DAY + 2 * HOUR, 11],
    ['exatamente 30 dias', 30 * DAY, 30],
    ['30 dias e 1 minuto', 30 * DAY + MINUTE, 31],
    ['exatamente 180 dias', 180 * DAY, 180],
    ['180 dias e 1 minuto', 180 * DAY + MINUTE, 181],
    ['200 dias', 200 * DAY, 200],
    [
      '116 dias, 17 horas e 35 minutos',
      116 * DAY + 17 * HOUR + 35 * MINUTE,
      117,
    ],
    ['1 minuto', MINUTE, 1],
  ])('%s => %i dias', (_label, ms, expected) => {
    expect(remainingDays(after(ms), NOW)).toBe(expected);
  });

  it('é zero quando o fim já passou ou é agora', () => {
    expect(remainingDays(after(-DAY), NOW)).toBe(0);
    expect(remainingDays(after(-1), NOW)).toBe(0);
    expect(remainingDays(NOW, NOW)).toBe(0);
  });
});

describe('penaltyRatePercent', () => {
  it.each<[number, number]>([
    [0, 0],
    [1, 5],
    [30, 5],
    [31, 10],
    [180, 10],
    [181, 20],
    [1095, 20],
  ])('%i dias => %i%%', (days, expected) => {
    expect(penaltyRatePercent(days)).toBe(expected);
  });
});

describe('loyaltyWindowError', () => {
  it('aceita de 1 minuto até exatamente 1.095 dias depois da compra', () => {
    expect(loyaltyWindowError(after(MINUTE), NOW)).toBeNull();
    expect(loyaltyWindowError(after(1095 * DAY), NOW)).toBeNull();
  });

  it('recusa o próprio momento da compra e datas passadas', () => {
    expect(loyaltyWindowError(NOW, NOW)).not.toBeNull();
    expect(loyaltyWindowError(after(-DAY), NOW)).not.toBeNull();
  });

  it('recusa mais de 1.095 dias', () => {
    expect(loyaltyWindowError(after(1095 * DAY + 1), NOW)).not.toBeNull();
    expect(loyaltyWindowError(after(1096 * DAY), NOW)).not.toBeNull();
  });
});
