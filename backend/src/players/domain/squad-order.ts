import { compareText, nameSortKey } from '../../common/text';
import { PlayerPosition } from './player.types';

// RN11: o elenco vai de trás para frente, e não em ordem alfabética.
const POSITION_RANK: Record<PlayerPosition, number> = {
  GOL: 1,
  ZAG: 2,
  LAT: 3,
  MEI: 4,
  ATA: 5,
};

export interface SquadMember {
  id: number;
  name: string;
  position: PlayerPosition;
}

// RN11: ordena por posição (GOL, ZAG, LAT, MEI, ATA), depois pelo nome
// (sem acento e sem diferenciar maiúsculas) e, por fim, pelo id.
export function compareSquadOrder(a: SquadMember, b: SquadMember): number {
  return (
    POSITION_RANK[a.position] - POSITION_RANK[b.position] ||
    compareText(nameSortKey(a.name), nameSortKey(b.name)) ||
    a.id - b.id
  );
}
