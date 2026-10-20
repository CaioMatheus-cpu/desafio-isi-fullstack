import {
  summarizeTransactions,
  TransactionAmounts,
} from './transaction-summary';

// Compra e venda do Meia Lua, como no exemplo do enunciado.
const purchase: TransactionAmounts = {
  type: 'COMPRA',
  valueCents: 3700,
  feeCents: 185,
  penaltyCents: 0,
  profitCents: null,
  cashChangeCents: -3885,
};
const sale: TransactionAmounts = {
  type: 'VENDA',
  valueCents: 4000,
  feeCents: 30,
  penaltyCents: 400,
  profitCents: 300,
  cashChangeCents: 3570,
};

describe('summarizeTransactions', () => {
  it('sem transações tudo é zero', () => {
    expect(summarizeTransactions([])).toEqual({
      totalSpentCents: 0,
      totalReceivedCents: 0,
      totalFeesCents: 0,
      totalPenaltiesCents: 0,
      totalProfitCents: 0,
    });
  });

  it('só a venda: total_spent é zero (exemplo 2.3.3 do enunciado)', () => {
    expect(summarizeTransactions([sale])).toEqual({
      totalSpentCents: 0,
      totalReceivedCents: 3570,
      totalFeesCents: 30,
      totalPenaltiesCents: 400,
      totalProfitCents: 300,
    });
  });

  it('compra e venda juntas (exemplo 2.3.3 do enunciado)', () => {
    expect(summarizeTransactions([sale, purchase])).toEqual({
      totalSpentCents: 3885,
      totalReceivedCents: 3570,
      totalFeesCents: 215,
      totalPenaltiesCents: 400,
      totalProfitCents: 300,
    });
  });

  it('o lucro soma com sinal: prejuízo reduz o total', () => {
    const loss: TransactionAmounts = { ...sale, profitCents: -750 };
    expect(summarizeTransactions([sale, loss]).totalProfitCents).toBe(-450);
  });
});
