import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ListPlayersQuery, PlayerSort } from '../query/list-players.query';

// ATENÇÃO: o valor de mercado NÃO é gravado, então para filtrar e ordenar a
// listagem a gente precisa calculá-lo dentro do SQL. Esta expressão é a mesma
// fórmula de domain/market-value.ts (RN02 a RN05) escrita em SQL. É a única
// duplicação permitida pelo barema, e só serve para filtrar e ordenar: o valor
// que aparece na resposta vem sempre da função TypeScript.
// Tudo em centavos inteiros e milésimos de percentual, como na função.
const CONDITION_DISCOUNT = `
  CASE p.condition
    WHEN 'MAL_CONDICIONADO' THEN
      CASE WHEN p.agility >= 80 THEN 75 WHEN p.agility <= 30 THEN 250 ELSE 150 END
    WHEN 'DOENTE' THEN
      CASE WHEN p.agility >= 80 THEN 150 WHEN p.agility <= 30 THEN 400 ELSE 300 END
    ELSE 0
  END`;

const AGE_ADJUSTMENT = `
  CASE WHEN p.age <= 21 THEN 100 WHEN p.age >= 32 THEN -100 ELSE 0 END`;

export const MARKET_VALUE_CENTS_SQL = `
  GREATEST(
    (
      2 * (
        CAST(p.base_value * 100 AS bigint)
        * (1000 + GREATEST((${AGE_ADJUSTMENT}) - (${CONDITION_DISCOUNT}), -400))
      ) + 1000
    ) / 2000,
    100
  )`;

// Nome para ordenar: minúsculo, sem acento e comparado caractere a caractere
// pela ordem Unicode (COLLATE "C"), como manda o enunciado. Assim o espaço vem
// antes do hífen e o hífen antes das letras.
const NAME_SORT_KEY = `lower(unaccent(p.name)) COLLATE "C"`;

const POSITION_RANK = `
  CASE p.position
    WHEN 'GOL' THEN 1 WHEN 'ZAG' THEN 2 WHEN 'LAT' THEN 3
    WHEN 'MEI' THEN 4 WHEN 'ATA' THEN 5
  END`;

// Só entram aqui trechos fixos do código. Nada que vem da requisição é
// concatenado no SQL: os valores vão sempre como parâmetros.
const ORDER_BY: Record<PlayerSort, string> = {
  name: `${NAME_SORT_KEY} ASC`,
  value_asc: 'market_value_cents ASC',
  value_desc: 'market_value_cents DESC',
  age_asc: 'p.age ASC',
  age_desc: 'p.age DESC',
  position: `${POSITION_RANK} ASC`,
};

export interface PlayersPageIds {
  ids: number[];
  total: number;
}

@Injectable()
export class PlayersListingRepository {
  constructor(private readonly dataSource: DataSource) {}

  async search(query: ListPlayersQuery): Promise<PlayersPageIds> {
    const params: unknown[] = [];
    const bind = (value: unknown): string => {
      params.push(value);
      return `$${params.length}`;
    };

    const conditions = ['p.deleted_at IS NULL'];
    if (query.search !== undefined) {
      conditions.push(
        `position(lower(unaccent(${bind(query.search)}::text)) in lower(unaccent(p.name))) > 0`,
      );
    }
    if (query.position !== undefined) {
      conditions.push(`p.position = ${bind(query.position)}`);
    }
    if (query.condition !== undefined) {
      conditions.push(`p.condition = ${bind(query.condition)}`);
    }
    if (query.free !== undefined) {
      conditions.push(
        query.free ? 'p.club_id IS NULL' : 'p.club_id IS NOT NULL',
      );
    }
    if (query.clubId !== undefined) {
      conditions.push(`p.club_id = ${bind(query.clubId)}`);
    }
    if (query.minAge !== undefined) {
      conditions.push(`p.age >= ${bind(query.minAge)}`);
    }
    if (query.maxAge !== undefined) {
      conditions.push(`p.age <= ${bind(query.maxAge)}`);
    }

    // O valor de mercado só existe depois de calculado, então o filtro de
    // valor fica numa consulta de fora, sobre o resultado da de dentro.
    const valueConditions: string[] = [];
    if (query.minValueCents !== undefined) {
      valueConditions.push(
        `market_value_cents >= ${bind(query.minValueCents)}`,
      );
    }
    if (query.maxValueCents !== undefined) {
      valueConditions.push(
        `market_value_cents <= ${bind(query.maxValueCents)}`,
      );
    }
    const valueWhere = valueConditions.length
      ? `WHERE ${valueConditions.join(' AND ')}`
      : '';

    const priced = `
      WITH priced AS (
        SELECT p.id, p.name, p.age, p.position,
               (${MARKET_VALUE_CENTS_SQL}) AS market_value_cents
        FROM players p
        WHERE ${conditions.join(' AND ')}
      )`;

    const counted: { total: string }[] = await this.dataSource.query(
      `${priced} SELECT COUNT(*) AS total FROM priced p ${valueWhere}`,
      params,
    );

    const orderBy = [
      ...query.sort.map((sort) => ORDER_BY[sort]),
      `${NAME_SORT_KEY} ASC`,
      'p.id ASC',
    ].join(', ');
    const offset = (query.page - 1) * query.limit;
    const rows: { id: number }[] = await this.dataSource.query(
      `${priced}
       SELECT p.id FROM priced p ${valueWhere}
       ORDER BY ${orderBy}
       LIMIT ${bind(query.limit)} OFFSET ${bind(offset)}`,
      params,
    );

    return { ids: rows.map((row) => row.id), total: Number(counted[0].total) };
  }
}
