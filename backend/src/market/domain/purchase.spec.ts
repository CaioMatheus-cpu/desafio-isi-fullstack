import { calculatePurchaseFeeCents, isWithinCashLimit } from './purchase';

describe('calculatePurchaseFeeCents', () => {
  // Tabela da RN13 do enunciado.
  it.each<[number, number]>([
    [2800, 0], // 28,00: abaixo de 30,00
    [3000, 0], // 30,00 exato: não é maior que 30,00
    [3001, 150], // 30,01: 1,5005 arredonda para 1,50
    [4762, 238], // 47,62: 2,381 vira 2,38
    [4800, 240], // 48,00 => 2,40
    [3700, 185], // 37,00 => 1,85 (exemplo do endpoint de compra)
  ])('valor %i centavos => taxa %i centavos', (value, expected) => {
    expect(calculatePurchaseFeeCents(value)).toBe(expected);
  });

  it('arredonda o meio para longe do zero', () => {
    // 30,10: 5% = 1,505 => 1,51
    expect(calculatePurchaseFeeCents(3010)).toBe(151);
  });
});

describe('isWithinCashLimit', () => {
  it.each<[string, number, number, boolean]>([
    ['28,00 com caixa de 300,00', 2800, 30000, true],
    ['31,51 com caixa de 300,00', 3151, 30000, true],
    ['50,00 com caixa de 100,00 (igual ao limite)', 5000, 10000, true],
    ['50,40 com caixa de 100,00', 5040, 10000, false],
  ])('%s', (_label, cost, cash, expected) => {
    expect(isWithinCashLimit(cost, cash)).toBe(expected);
  });

  it('não arredonda o limite: caixa 261,15 => limite 130,575', () => {
    expect(isWithinCashLimit(13057, 26115)).toBe(true);
    expect(isWithinCashLimit(13058, 26115)).toBe(false);
  });
});
