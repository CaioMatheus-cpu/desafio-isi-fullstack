import { parseQueryInteger, readQueryParam } from '../../common/query-params';

export interface ListMatchesQuery {
  clubId?: number;
}

// GET /matches aceita só club_id (opcional): um inteiro positivo. Vazio,
// repetido ou fora do formato é 400; parâmetros desconhecidos são ignorados.
export function parseListMatchesQuery(
  raw: Record<string, unknown>,
): ListMatchesQuery {
  return {
    clubId: parseQueryInteger(readQueryParam(raw, 'club_id'), 'club_id'),
  };
}
