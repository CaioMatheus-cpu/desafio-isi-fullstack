import { PlayerCondition } from './player.types';
import { fromCents, roundDivision, toCents } from './rounding';

// Os percentuais aqui estão em milésimos (150 = 15%). Parece estranho, mas é
// o que deixa a metade do desconto (7,5%) ser um inteiro e evita float.
const DISCOUNT_BY_CONDITION: Record<PlayerCondition, number> = {
  APTO: 0,
  MAL_CONDICIONADO: 150,
  DOENTE: 300,
};

const YOUNG_PLAYER_MAX_AGE = 21;
const VETERAN_MIN_AGE = 32;
const AGE_ADJUSTMENT = 100;

const HIGH_AGILITY_MIN = 80;
const LOW_AGILITY_MAX = 30;
const LOW_AGILITY_EXTRA_DISCOUNT = 100;

const MAX_TOTAL_DISCOUNT = 400;
const MIN_MARKET_VALUE_CENTS = 100;

// A agilidade só mexe no desconto de quem NÃO está apto. Muito ágil (80+)
// recupera rápido, então o desconto cai pela metade; pouco ágil (até 30)
// sofre mais, então leva 10 pontos a mais. No meio do caminho, nada muda.
function conditionDiscount(
  condition: PlayerCondition,
  agility: number,
): number {
  const baseDiscount = DISCOUNT_BY_CONDITION[condition];
  if (condition === 'APTO') {
    return 0;
  }
  if (agility >= HIGH_AGILITY_MIN) {
    return baseDiscount / 2;
  }
  if (agility <= LOW_AGILITY_MAX) {
    return baseDiscount + LOW_AGILITY_EXTRA_DISCOUNT;
  }
  return baseDiscount;
}

// A idade vale para todo mundo, inclusive para quem está APTO: jovem
// promessa (até 21) valoriza 10%, veterano (32+) desvaloriza 10%.
function ageAdjustment(age: number): number {
  if (age <= YOUNG_PLAYER_MAX_AGE) {
    return AGE_ADJUSTMENT;
  }
  if (age >= VETERAN_MIN_AGE) {
    return -AGE_ADJUSTMENT;
  }
  return 0;
}

// Valor de mercado (RN05). Nunca é gravado: muda quando a condição, a
// agilidade ou a idade mudam, então a gente recalcula a cada consulta.
export function calculateMarketValueCents(
  baseValue: number,
  condition: PlayerCondition,
  agility: number,
  age: number,
): number {
  const totalAdjustment =
    ageAdjustment(age) - conditionDiscount(condition, agility);

  // Ninguém perde mais que 40% do valor base, não importa o tamanho do estrago.
  const limitedAdjustment = Math.max(totalAdjustment, -MAX_TOTAL_DISCOUNT);

  const valueCents = roundDivision(
    toCents(baseValue) * (1000 + limitedAdjustment),
    1000,
  );

  // E o valor também nunca cai abaixo de 1,00.
  return Math.max(valueCents, MIN_MARKET_VALUE_CENTS);
}

// O mesmo valor de mercado, em reais, para quem vai mostrar na resposta.
export function calculateMarketValue(
  baseValue: number,
  condition: PlayerCondition,
  agility: number,
  age: number,
): number {
  return fromCents(
    calculateMarketValueCents(baseValue, condition, agility, age),
  );
}
