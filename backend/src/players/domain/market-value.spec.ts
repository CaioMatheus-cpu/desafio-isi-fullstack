import { calculateMarketValue } from './market-value';
import { PlayerCondition } from './player.types';

describe('calculateMarketValue', () => {
  // Casos da tabela do enunciado (RN05).
  it.each<[number, PlayerCondition, number, number, number]>([
    [82, 'APTO', 20, 25, 82.0],
    [82, 'APTO', 50, 19, 90.2],
    [82, 'MAL_CONDICIONADO', 50, 25, 69.7],
    [82, 'MAL_CONDICIONADO', 80, 21, 84.05],
    [82, 'MAL_CONDICIONADO', 30, 33, 53.3],
    [82, 'DOENTE', 90, 25, 69.7],
    [82, 'DOENTE', 30, 25, 49.2],
    [82, 'DOENTE', 10, 40, 49.2],
    [9.5, 'MAL_CONDICIONADO', 85, 25, 8.79],
    [1, 'MAL_CONDICIONADO', 50, 35, 1.0],
  ])(
    'base %f, %s, agilidade %i, idade %i => %f',
    (baseValue, condition, agility, age, expected) => {
      expect(calculateMarketValue(baseValue, condition, agility, age)).toBe(
        expected,
      );
    },
  );

  describe('fronteiras de agilidade (só pesa para quem não está APTO)', () => {
    it.each<[number, number]>([
      [30, 53.3], // 15% + 10 pontos = 25%, com -10% da idade veterana
      [31, 61.5], // sem efeito: 15%, com -10% da idade veterana
      [79, 61.5],
      [80, 67.65], // metade do desconto: 7,5%, com -10% da idade veterana
    ])(
      'MAL_CONDICIONADO, idade 33, agilidade %i => %f',
      (agility, expected) => {
        expect(calculateMarketValue(82, 'MAL_CONDICIONADO', agility, 33)).toBe(
          expected,
        );
      },
    );

    it('APTO ignora a agilidade', () => {
      expect(calculateMarketValue(82, 'APTO', 1, 25)).toBe(82);
      expect(calculateMarketValue(82, 'APTO', 100, 25)).toBe(82);
    });
  });

  describe('fronteiras de idade', () => {
    it.each<[number, number]>([
      [21, 90.2],
      [22, 82.0],
      [31, 82.0],
      [32, 73.8],
    ])('APTO, idade %i => %f', (age, expected) => {
      expect(calculateMarketValue(82, 'APTO', 50, age)).toBe(expected);
    });
  });
});
