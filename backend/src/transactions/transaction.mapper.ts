import { formatBrasiliaDateTime } from '../common/brasilia-time';
import { Transaction } from '../database/entities/transaction.entity';
import { fromCents, toCents } from '../players/domain/rounding';
import { TransactionAmounts } from './domain/transaction-summary';
import { CsvTransaction } from './domain/transactions-csv';
import { TransactionSummary } from './domain/transaction-summary';

export interface TransactionResponse {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: 'COMPRA' | 'VENDA';
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

export interface TransactionsPage {
  data: TransactionResponse[];
  summary: {
    total_spent: number;
    total_received: number;
    total_fees: number;
    total_penalties: number;
    total_profit: number;
  };
}

// As colunas DECIMAL chegam do banco como texto; aqui viram centavos inteiros.
export function toAmounts(transaction: Transaction): TransactionAmounts {
  return {
    type: transaction.type as TransactionAmounts['type'],
    valueCents: toCents(Number(transaction.value)),
    feeCents: toCents(Number(transaction.fee)),
    penaltyCents: toCents(Number(transaction.penalty)),
    profitCents:
      transaction.profit === null ? null : toCents(Number(transaction.profit)),
    cashChangeCents: toCents(Number(transaction.cashChange)),
  };
}

export function toTransactionResponse(
  transaction: Transaction,
): TransactionResponse {
  const amounts = toAmounts(transaction);
  return {
    id: transaction.id,
    club_id: transaction.clubId,
    player_id: transaction.playerId,
    player_name: transaction.playerName,
    type: amounts.type,
    value: fromCents(amounts.valueCents),
    fee: fromCents(amounts.feeCents),
    penalty: fromCents(amounts.penaltyCents),
    profit:
      amounts.profitCents === null ? null : fromCents(amounts.profitCents),
    cash_change: fromCents(amounts.cashChangeCents),
    created_at: formatBrasiliaDateTime(transaction.createdAt),
  };
}

export function toSummaryResponse(
  summary: TransactionSummary,
): TransactionsPage['summary'] {
  return {
    total_spent: fromCents(summary.totalSpentCents),
    total_received: fromCents(summary.totalReceivedCents),
    total_fees: fromCents(summary.totalFeesCents),
    total_penalties: fromCents(summary.totalPenaltiesCents),
    total_profit: fromCents(summary.totalProfitCents),
  };
}

export function toCsvTransaction(transaction: Transaction): CsvTransaction {
  const amounts = toAmounts(transaction);
  return {
    createdAt: formatBrasiliaDateTime(transaction.createdAt),
    type: amounts.type,
    playerName: transaction.playerName,
    valueCents: amounts.valueCents,
    feeCents: amounts.feeCents,
    penaltyCents: amounts.penaltyCents,
    profitCents: amounts.profitCents,
    cashChangeCents: amounts.cashChangeCents,
  };
}
