import { roundDivision, toCents } from './rounding';

describe('roundDivision', () => {
  it('arredonda o meio para longe do zero', () => {
    expect(roundDivision(1475, 100)).toBe(15);
    expect(roundDivision(5, 2)).toBe(3);
    expect(roundDivision(-5, 2)).toBe(-3);
  });

  it('arredonda para o mais próximo quando não é meio', () => {
    expect(roundDivision(7, 3)).toBe(2);
    expect(roundDivision(8, 3)).toBe(3);
    expect(roundDivision(-7, 3)).toBe(-2);
  });
});

describe('toCents', () => {
  it('converte sem erro de float', () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents(261.15)).toBe(26115);
  });
});
