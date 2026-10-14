import { PlayerAttributes, PlayerPosition } from './player.types';

// Quanto cada atributo pesa no overall de cada posição, em %. Cada linha
// soma 100: o goleiro vive de defesa e físico, o atacante de finalização.
const ATTRIBUTE_WEIGHTS: Record<PlayerPosition, PlayerAttributes> = {
  GOL: {
    pace: 10,
    shooting: 0,
    passing: 20,
    dribbling: 0,
    defending: 40,
    physical: 30,
  },
  ZAG: {
    pace: 10,
    shooting: 0,
    passing: 15,
    dribbling: 0,
    defending: 45,
    physical: 30,
  },
  LAT: {
    pace: 25,
    shooting: 0,
    passing: 20,
    dribbling: 15,
    defending: 25,
    physical: 15,
  },
  MEI: {
    pace: 10,
    shooting: 15,
    passing: 35,
    dribbling: 25,
    defending: 5,
    physical: 10,
  },
  ATA: {
    pace: 20,
    shooting: 40,
    passing: 10,
    dribbling: 20,
    defending: 0,
    physical: 10,
  },
};

const ATTRIBUTE_NAMES = Object.keys(
  ATTRIBUTE_WEIGHTS.GOL,
) as (keyof PlayerAttributes)[];

// Overall (RN06): média dos atributos ponderada pela posição, arredondada
// para o inteiro mais próximo (72,5 sobe para 73). Como a posição pode mudar
// no PUT, ele nunca é gravado, só calculado quando alguém pergunta.
export function calculateOverall(
  position: PlayerPosition,
  attributes: PlayerAttributes,
): number {
  const weights = ATTRIBUTE_WEIGHTS[position];
  const weightedSum = ATTRIBUTE_NAMES.reduce(
    (sum, name) => sum + attributes[name] * weights[name],
    0,
  );
  // weightedSum / 100 com o meio arredondado para cima, sem usar float.
  return Math.floor((weightedSum + 50) / 100);
}
