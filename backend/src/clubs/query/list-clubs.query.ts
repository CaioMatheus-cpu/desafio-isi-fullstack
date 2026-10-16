import { BadRequestException } from '@nestjs/common';

export const CLUB_SORT_OPTIONS = [
  'name',
  'net_worth_asc',
  'net_worth_desc',
] as const;
export type ClubSort = (typeof CLUB_SORT_OPTIONS)[number];

export interface ListClubsQuery {
  sort: ClubSort;
}

// GET /clubs aceita só o parâmetro sort, com um único valor. Ausente usa o
// padrão (nome); presente e vazio, repetido ou fora da lista é 400.
// Parâmetros com outros nomes são ignorados.
export function parseListClubsQuery(
  raw: Record<string, unknown>,
): ListClubsQuery {
  const sort = raw.sort;
  if (sort === undefined) {
    return { sort: 'name' };
  }
  if (
    typeof sort !== 'string' ||
    !CLUB_SORT_OPTIONS.includes(sort as ClubSort)
  ) {
    throw new BadRequestException(
      `sort deve ser um destes valores: ${CLUB_SORT_OPTIONS.join(', ')}.`,
    );
  }
  return { sort: sort as ClubSort };
}
