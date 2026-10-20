import { TransactionType } from './transaction-summary';

export interface CsvTransaction {
  createdAt: string;
  type: TransactionType;
  playerName: string;
  valueCents: number;
  feeCents: number;
  penaltyCents: number;
  profitCents: number | null;
  cashChangeCents: number;
}

const SEPARATOR = ';';
const HEADER = [
  'data_hora',
  'tipo',
  'jogador',
  'valor',
  'taxa_ou_comissao',
  'multa',
  'lucro',
  'variacao_caixa',
].join(SEPARATOR);

// Valor com 2 casas e vírgula decimal; negativo com "-" (ex.: -38,85).
function formatMoney(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

// Nome com ponto e vírgula ou aspas vai entre aspas duplas, e cada aspa
// interna é duplicada: Zé "Foguete" Lima vira "Zé ""Foguete"" Lima".
function escapeField(text: string): string {
  const needsQuotes = text.includes(SEPARATOR) || text.includes('"');
  return needsQuotes ? `"${text.replace(/"/g, '""')}"` : text;
}

// RN18: texto CSV com o cabeçalho e uma linha por transação, na mesma ordem
// do histórico. Cada linha termina em \n (LF), inclusive a última, e o
// arquivo é UTF-8 sem BOM. Sem transações, só a linha do cabeçalho.
export function buildTransactionsCsv(transactions: CsvTransaction[]): string {
  const lines = transactions.map((transaction) =>
    [
      transaction.createdAt,
      transaction.type,
      escapeField(transaction.playerName),
      formatMoney(transaction.valueCents),
      formatMoney(transaction.feeCents),
      formatMoney(transaction.penaltyCents),
      transaction.profitCents === null
        ? ''
        : formatMoney(transaction.profitCents),
      formatMoney(transaction.cashChangeCents),
    ].join(SEPARATOR),
  );
  return [HEADER, ...lines].map((line) => `${line}\n`).join('');
}
