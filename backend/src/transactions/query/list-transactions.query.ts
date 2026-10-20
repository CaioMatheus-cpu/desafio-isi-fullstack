import { BadRequestException } from '@nestjs/common';
import { parseQueryInteger, readQueryParam } from '../../common/query-params';
import { TransactionType } from '../domain/transaction-summary';

export interface ListTransactionsQuery {
  types?: TransactionType[];
  playerId?: number;
}

const TYPES: readonly TransactionType[] = ['COMPRA', 'VENDA'];

// Filtros do histórico e da exportação (os mesmos nos dois). Ambos são
// opcionais. type aceita um ou mais valores separados por vírgula, sem
// espaços e sem repetir; player_id é um inteiro positivo. Valor vazio, fora
// da lista ou em minúsculas é 400. Parâmetros desconhecidos são ignorados.
export function parseListTransactionsQuery(
  raw: Record<string, unknown>,
): ListTransactionsQuery {
  return {
    types: parseTypes(readQueryParam(raw, 'type')),
    playerId: parseQueryInteger(readQueryParam(raw, 'player_id'), 'player_id'),
  };
}

function parseTypes(value: string | undefined): TransactionType[] | undefined {
  if (value === undefined) {
    return undefined;
  }
  const types = value.split(',');
  const valid = types.every((type) => TYPES.includes(type as TransactionType));
  if (!valid || new Set(types).size !== types.length) {
    throw new BadRequestException(
      'type deve ser COMPRA, VENDA ou os dois separados por vírgula, sem repetir.',
    );
  }
  return types as TransactionType[];
}
