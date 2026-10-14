import { normalizeName, playerNameError } from './player-name';

describe('normalizeName', () => {
  it('apara as pontas e junta espaços repetidos', () => {
    expect(normalizeName('  Meia   Zeta ')).toBe('Meia Zeta');
  });

  it('não mexe em tabulação, que o enunciado manda recusar', () => {
    expect(normalizeName('Ana\tLima')).toBe('Ana\tLima');
  });

  it('devolve intacto o que não é texto', () => {
    expect(normalizeName(10)).toBe(10);
    expect(normalizeName(null)).toBeNull();
  });
});

describe('playerNameError', () => {
  it.each(['Meia Lua', 'Zé Maria-José', 'Ana Lima'])('aceita %p', (name) => {
    expect(playerNameError(name)).toBeNull();
  });

  it.each([
    ['uma palavra só', 'Pele'],
    ['com número', 'Ana Lima 2'],
    ['curto demais', 'Al'],
    ['com tabulação', 'Ana\tLima'],
    ['com quebra de linha', 'Ana\nLima'],
    ['longo demais', `${'A'.repeat(50)} ${'B'.repeat(50)}`],
    ['só símbolos na segunda palavra', 'Ana --'],
  ])('recusa nome %s', (_motivo, name) => {
    expect(playerNameError(name)).not.toBeNull();
  });
});
