export type TransactionType = 'COMPRA' | 'VENDA';

// Os valores de uma transação, todos em centavos.
export interface TransactionAmounts {
  type: TransactionType;
  valueCents: number;
  feeCents: number;
  penaltyCents: number;
  profitCents: number | null;
  cashChangeCents: number;
}

export interface TransactionSummary {
  totalSpentCents: number;
  totalReceivedCents: number;
  totalFeesCents: number;
  totalPenaltiesCents: number;
  totalProfitCents: number;
}

// RN17: os totais das transações JÁ filtradas.
//  - total_spent: valor + taxa das compras;
//  - total_received: variação do caixa (crédito líquido) das vendas;
//  - total_fees: taxas e comissões de todas as transações;
//  - total_penalties: multas das vendas;
//  - total_profit: lucro das vendas, com sinal.
// Sem transações, tudo é zero.
export function summarizeTransactions(
  transactions: TransactionAmounts[],
): TransactionSummary {
  const summary: TransactionSummary = {
    totalSpentCents: 0,
    totalReceivedCents: 0,
    totalFeesCents: 0,
    totalPenaltiesCents: 0,
    totalProfitCents: 0,
  };

  for (const transaction of transactions) {
    summary.totalFeesCents += transaction.feeCents;
    if (transaction.type === 'COMPRA') {
      summary.totalSpentCents += transaction.valueCents + transaction.feeCents;
    } else {
      summary.totalReceivedCents += transaction.cashChangeCents;
      summary.totalPenaltiesCents += transaction.penaltyCents;
      summary.totalProfitCents += transaction.profitCents ?? 0;
    }
  }
  return summary;
}
