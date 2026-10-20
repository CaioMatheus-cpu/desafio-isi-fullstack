import { BadRequestException } from '@nestjs/common';
import {
  PLAYER_CONDITIONS,
  PLAYER_POSITIONS,
  PlayerCondition,
  PlayerPosition,
} from '../domain/player.types';
import {
  MAX_ID,
  parseQueryInteger,
  readQueryParam,
} from '../../common/query-params';
import { AGE_MAX, AGE_MIN } from '../validation/player-limits';
import { hasControlCharacters, normalizeName } from '../validation/player-name';

export const PLAYER_SORT_OPTIONS = [
  'name',
  'value_asc',
  'value_desc',
  'age_asc',
  'age_desc',
  'position',
] as const;
export type PlayerSort = (typeof PLAYER_SORT_OPTIONS)[number];

export interface ListPlayersQuery {
  search?: string;
  position?: PlayerPosition;
  condition?: PlayerCondition;
  free?: boolean;
  clubId?: number;
  minAge?: number;
  maxAge?: number;
  minValueCents?: number;
  maxValueCents?: number;
  sort: PlayerSort[];
  page: number;
  limit: number;
}

const SEARCH_MIN_LENGTH = 2;
const SEARCH_MAX_LENGTH = 100;
const VALUE_MAX_CENTS = 55000;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const LIMIT_MAX = 50;
const MAX_SORT_CRITERIA = 2;

const DECIMAL = /^(0|[1-9][0-9]*)(\.[0-9]{1,2})?$/;

type RawQuery = Record<string, unknown>;

// Lê a query string da listagem, confere cada parâmetro e devolve tudo já
// no tipo certo. Parâmetro ausente não filtra; presente e vazio é erro;
// valor fora do que o enunciado aceita é 400. Nomes desconhecidos são
// ignorados. Aqui só olhamos o texto: existência de clube é com o serviço.
export function parseListPlayersQuery(raw: RawQuery): ListPlayersQuery {
  const query: ListPlayersQuery = {
    search: parseSearch(readQueryParam(raw, 'search')),
    position: parseOneOf(
      readQueryParam(raw, 'position'),
      'position',
      PLAYER_POSITIONS,
    ),
    condition: parseOneOf(
      readQueryParam(raw, 'condition'),
      'condition',
      PLAYER_CONDITIONS,
    ),
    free: parseBoolean(readQueryParam(raw, 'free'), 'free'),
    clubId: parseQueryInteger(
      readQueryParam(raw, 'club_id'),
      'club_id',
      1,
      MAX_ID,
    ),
    minAge: parseQueryInteger(
      readQueryParam(raw, 'min_age'),
      'min_age',
      AGE_MIN,
      AGE_MAX,
    ),
    maxAge: parseQueryInteger(
      readQueryParam(raw, 'max_age'),
      'max_age',
      AGE_MIN,
      AGE_MAX,
    ),
    minValueCents: parseValueInCents(
      readQueryParam(raw, 'min_value'),
      'min_value',
    ),
    maxValueCents: parseValueInCents(
      readQueryParam(raw, 'max_value'),
      'max_value',
    ),
    sort: parseSort(readQueryParam(raw, 'sort')),
    page:
      parseQueryInteger(readQueryParam(raw, 'page'), 'page', 1, MAX_ID) ??
      DEFAULT_PAGE,
    limit:
      parseQueryInteger(readQueryParam(raw, 'limit'), 'limit', 1, LIMIT_MAX) ??
      DEFAULT_LIMIT,
  };

  rejectContradictions(query);
  return query;
}

function parseSearch(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const normalized = normalizeName(value) as string;
  if (hasControlCharacters(normalized)) {
    throw new BadRequestException(
      'search não pode ter caracteres de controle.',
    );
  }
  const length = Array.from(normalized).length;
  if (length < SEARCH_MIN_LENGTH || length > SEARCH_MAX_LENGTH) {
    throw new BadRequestException(
      `search deve ter de ${SEARCH_MIN_LENGTH} a ${SEARCH_MAX_LENGTH} caracteres.`,
    );
  }
  return normalized;
}

function parseOneOf<T extends string>(
  value: string | undefined,
  name: string,
  options: readonly T[],
): T | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!options.includes(value as T)) {
    throw new BadRequestException(
      `${name} deve ser um destes valores: ${options.join(', ')}.`,
    );
  }
  return value as T;
}

function parseBoolean(
  value: string | undefined,
  name: string,
): boolean | undefined {
  const parsed = parseOneOf(value, name, ['true', 'false'] as const);
  return parsed === undefined ? undefined : parsed === 'true';
}

// Decimal na forma 10, 10.5 ou 10.55, de 0 a 550. Devolve em centavos,
// já como inteiro, sem passar por float.
function parseValueInCents(
  value: string | undefined,
  name: string,
): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const valid = DECIMAL.exec(value);
  if (!valid) {
    throw new BadRequestException(
      `${name} deve ser um decimal como 10, 10.5 ou 10.55.`,
    );
  }
  const [whole, fraction = ''] = value.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (cents > VALUE_MAX_CENTS) {
    throw new BadRequestException(`${name} deve estar entre 0 e 550.`);
  }
  return cents;
}

// Até dois critérios, separados por vírgula, sem espaços, e sem repetir o
// campo (value_asc,value_desc é erro, porque os dois falam do valor).
function parseSort(value: string | undefined): PlayerSort[] {
  if (value === undefined) {
    return ['name'];
  }
  const criteria = value.split(',');
  const valid = criteria.every((criterion) =>
    PLAYER_SORT_OPTIONS.includes(criterion as PlayerSort),
  );
  if (!valid || criteria.length > MAX_SORT_CRITERIA) {
    throw new BadRequestException(
      `sort aceita até ${MAX_SORT_CRITERIA} destes valores, separados por vírgula: ${PLAYER_SORT_OPTIONS.join(', ')}.`,
    );
  }
  const fields = criteria.map((criterion) => criterion.split('_')[0]);
  if (new Set(fields).size !== fields.length) {
    throw new BadRequestException('sort não pode repetir o mesmo campo.');
  }
  return criteria as PlayerSort[];
}

function rejectContradictions(query: ListPlayersQuery): void {
  const { minAge, maxAge, minValueCents, maxValueCents } = query;
  if (minAge !== undefined && maxAge !== undefined && minAge > maxAge) {
    throw new BadRequestException('min_age não pode ser maior que max_age.');
  }
  if (
    minValueCents !== undefined &&
    maxValueCents !== undefined &&
    minValueCents > maxValueCents
  ) {
    throw new BadRequestException(
      'min_value não pode ser maior que max_value.',
    );
  }
  if (query.free === true && query.clubId !== undefined) {
    throw new BadRequestException(
      'free=true não pode ser combinado com club_id.',
    );
  }
}
