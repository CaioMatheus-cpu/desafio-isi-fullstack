import { fromCents, roundDivision } from './rounding';

const MIN_BASE_VALUE_CENTS = 100;
const YOUNG_PLAYER_MAX_AGE = 21;

// O valor base cresce em faixas: quanto mais alto o overall, mais caro cada
// ponto. Os valores abaixo estão em centavos por ponto de overall.
const OVERALL_TIERS = [
  { from: 41, to: 60, centsPerPoint: 50 },
  { from: 61, to: 75, centsPerPoint: 200 },
  { from: 76, to: 99, centsPerPoint: 600 },
];

// Soma só os pontos que caem dentro de cada faixa. Overall 70, por exemplo,
// rende 20 pontos na primeira faixa e 10 na segunda. Até 40 não rende nada.
function overallPartCents(overall: number): number {
  return OVERALL_TIERS.reduce((total, tier) => {
    const pointsInTier = Math.min(overall, tier.to) - (tier.from - 1);
    return total + Math.max(pointsInTier, 0) * tier.centsPerPoint;
  }, 0);
}

// Valor base (RN06): calculado UMA vez, no cadastro, e gravado. Depois disso
// não muda mais, nem se a posição ou a idade forem editadas.
export function calculateBaseValue(
  overall: number,
  potential: number,
  age: number,
): number {
  let valueCents = overallPartCents(overall);

  // Jovem promessa: quanto maior a distância entre o potencial e o overall
  // de hoje, mais o jogador vale. Só entra no cálculo até os 21 anos.
  if (age <= YOUNG_PLAYER_MAX_AGE) {
    valueCents = roundDivision(valueCents * (100 + potential - overall), 100);
  }

  return fromCents(Math.max(valueCents, MIN_BASE_VALUE_CENTS));
}
