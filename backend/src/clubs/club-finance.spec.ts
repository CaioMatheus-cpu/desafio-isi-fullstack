import {
  calculateNetWorthCents,
  calculateSquadValueCents,
} from './club-finance';

const player = (
  baseValue: string,
  condition: string,
  agility: number,
  age: number,
) => ({ baseValue, condition, agility, age });

describe('calculateSquadValueCents', () => {
  it('elenco vazio vale zero', () => {
    expect(calculateSquadValueCents([])).toBe(0);
  });

  it('soma o valor de mercado de cada jogador, e não o valor base', () => {
    const squad = [
      player('82.00', 'APTO', 20, 25), // 82,00
      player('82.00', 'MAL_CONDICIONADO', 50, 25), // 69,70
      player('82.00', 'DOENTE', 30, 25), // 49,20
    ];
    expect(calculateSquadValueCents(squad)).toBe(8200 + 6970 + 4920);
  });
});

describe('calculateNetWorthCents', () => {
  it('patrimônio é o caixa mais o valor do elenco', () => {
    // Exemplo do enunciado: caixa 261,15 + elenco 37,00 = 298,15.
    expect(calculateNetWorthCents(26115, 3700)).toBe(29815);
  });
});
