import { PlayerPosition } from '../../players/domain/player.types';

export const FORMATIONS = ['3-1', '2-2', '2-1-1', '1-2-1'] as const;
export type Formation = (typeof FORMATIONS)[number];

export const LINEUP_SIZE = 5;

interface Sectors {
  defense: number;
  midfield: number;
  attack: number;
}

// RN19: a formação conta os 4 jogadores de linha por setor, de trás para
// frente, sem o goleiro. A defesa é de ZAG ou LAT, o meio é de MEI e o
// ataque é de ATA.
const SECTORS_BY_FORMATION: Record<Formation, Sectors> = {
  '3-1': { defense: 3, midfield: 0, attack: 1 },
  '2-2': { defense: 2, midfield: 0, attack: 2 },
  '2-1-1': { defense: 2, midfield: 1, attack: 1 },
  '1-2-1': { defense: 1, midfield: 2, attack: 1 },
};

// Os 5 titulares fecham a formação? Precisa de exatamente 1 GOL e, em cada
// setor, a quantidade da formação.
export function fitsFormation(
  positions: PlayerPosition[],
  formation: Formation,
): boolean {
  const count = (wanted: PlayerPosition[]) =>
    positions.filter((position) => wanted.includes(position)).length;
  const sectors = SECTORS_BY_FORMATION[formation];

  return (
    positions.length === LINEUP_SIZE &&
    count(['GOL']) === 1 &&
    count(['ZAG', 'LAT']) === sectors.defense &&
    count(['MEI']) === sectors.midfield &&
    count(['ATA']) === sectors.attack
  );
}
