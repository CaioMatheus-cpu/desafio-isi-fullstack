import { formatBrasiliaDateTime, parseBrasiliaDateTime } from './brasilia-time';

describe('parseBrasiliaDateTime', () => {
  it('converte o horário de Brasília para o instante real (+3h)', () => {
    const date = parseBrasiliaDateTime('2027-03-02T10:15-03:00');
    expect(date?.toISOString()).toBe('2027-03-02T13:15:00.000Z');
  });

  it('aceita as bordas do dia', () => {
    expect(parseBrasiliaDateTime('2027-03-02T00:00-03:00')).not.toBeNull();
    expect(parseBrasiliaDateTime('2027-03-02T23:59-03:00')).not.toBeNull();
  });

  it('aceita 29 de fevereiro só em ano bissexto', () => {
    expect(parseBrasiliaDateTime('2028-02-29T10:00-03:00')).not.toBeNull();
    expect(parseBrasiliaDateTime('2027-02-29T10:00-03:00')).toBeNull();
  });

  it.each([
    ['sem fuso', '2027-03-02T10:15'],
    ['com Z', '2027-03-02T10:15Z'],
    ['com outro fuso', '2027-03-02T10:15+00:00'],
    ['com segundos', '2027-03-02T10:15:00-03:00'],
    ['com espaço no lugar do T', '2027-03-02 10:15-03:00'],
    ['sem zero à esquerda', '2027-3-2T10:15-03:00'],
    ['dia que não existe', '2027-02-30T10:15-03:00'],
    ['mês 13', '2027-13-01T10:15-03:00'],
    ['hora 24', '2027-03-02T24:00-03:00'],
    ['minuto 60', '2027-03-02T10:60-03:00'],
    ['vazio', ''],
  ])('recusa %s', (_motivo, text) => {
    expect(parseBrasiliaDateTime(text)).toBeNull();
  });
});

describe('formatBrasiliaDateTime', () => {
  it('escreve com segundos e -03:00', () => {
    const date = new Date('2026-11-05T19:40:00.000Z');
    expect(formatBrasiliaDateTime(date)).toBe('2026-11-05T16:40:00-03:00');
  });

  it('vira o dia certo perto da meia-noite', () => {
    const date = new Date('2026-11-06T02:30:00.000Z');
    expect(formatBrasiliaDateTime(date)).toBe('2026-11-05T23:30:00-03:00');
  });

  it('é o inverso da leitura', () => {
    const text = '2027-03-02T10:15-03:00';
    const date = parseBrasiliaDateTime(text) as Date;
    expect(formatBrasiliaDateTime(date)).toBe('2027-03-02T10:15:00-03:00');
  });
});
