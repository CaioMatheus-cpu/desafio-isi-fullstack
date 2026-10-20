import {
  calculateCommissionCents,
  calculatePenaltyCents,
  calculateSale,
} from './sale';

describe('calculateCommissionCents', () => {
  // Tabela da RN16 do enunciado.
  it.each<[string, number, number]>([
    ['lucro 3,00', 300, 30],
    ['lucro 3,85 (0,385 arredonda para 0,39)', 385, 39],
    ['lucro 10,00', 1000, 100],
    ['lucro 10,01 (1,002 vira 1,00)', 1001, 100],
    ['lucro 15,00', 1500, 200],
    ['prejuízo de 7,50', -750, 0],
    ['lucro zero', 0, 0],
  ])('%s', (_label, profit, expected) => {
    expect(calculateCommissionCents(profit)).toBe(expected);
  });

  it('soma as duas faixas antes de arredondar, uma só vez', () => {
    // 20,03: 10% de 10,00 = 1,00 mais 20% de 10,03 = 2,006 => 3,006 => 3,01
    expect(calculateCommissionCents(2003)).toBe(301);
  });
});

describe('calculatePenaltyCents', () => {
  it.each<[string, number, number, number]>([
    ['10% de 40,00', 4000, 10, 400],
    ['20% de 42,50', 4250, 20, 850],
    ['5% de 30,00', 3000, 5, 150],
    ['0% de 25,00', 2500, 0, 0],
    ['20% de 75,00 passa de 10,00 e é limitada', 7500, 20, 1000],
    ['10% de 100,00 também é limitada', 10000, 10, 1000],
    ['exatamente 10,00 não é cortada', 5000, 20, 1000],
  ])('%s', (_label, value, rate, expected) => {
    expect(calculatePenaltyCents(value, rate)).toBe(expected);
  });
});

describe('calculateSale', () => {
  // Tabela da RN16: valor de compra, valor na venda, multa, lucro,
  // comissão e crédito no caixa. Os dias restantes escolhem o percentual.
  it.each<[string, number, number, number, number, number, number, number]>([
    ['multa de 10%', 3700, 4000, 117, 400, 300, 30, 3570],
    ['multa de 20% com prejuízo', 5000, 4250, 200, 850, -750, 0, 3400],
    [
      'multa de 5%, comissão 0,385 arredondada',
      2615,
      3000,
      10,
      150,
      385,
      39,
      2811,
    ],
    ['fidelidade cumprida', 2500, 2500, 0, 0, 0, 0, 2500],
    ['multa de 20% limitada a 10,00', 6000, 7500, 200, 1000, 1500, 200, 6300],
  ])(
    '%s',
    (_label, purchase, market, days, penalty, profit, commission, credit) => {
      const sale = calculateSale({
        marketValueCents: market,
        purchaseValueCents: purchase,
        remainingDays: days,
      });
      expect(sale.penaltyCents).toBe(penalty);
      expect(sale.profitCents).toBe(profit);
      expect(sale.commissionCents).toBe(commission);
      expect(sale.creditCents).toBe(credit);
    },
  );

  it('devolve o percentual da multa usado', () => {
    const sale = calculateSale({
      marketValueCents: 4000,
      purchaseValueCents: 3700,
      remainingDays: 117,
    });
    expect(sale.penaltyRatePercent).toBe(10);
  });
});
