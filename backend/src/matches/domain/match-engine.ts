import {
  PlayerAttributes,
  PlayerCondition,
  PlayerPosition,
} from '../../players/domain/player.types';
import { compareSquadOrder } from '../../players/domain/squad-order';

export type AttributeName = keyof PlayerAttributes;
export type MatchResult = 'MANDANTE' | 'VISITANTE' | 'EMPATE';

// Um titular, com os dados do momento da partida.
export interface Fielder {
  playerId: number;
  name: string;
  position: PlayerPosition;
  condition: PlayerCondition;
  attributes: PlayerAttributes;
}

// O time em campo: o goleiro e os 4 jogadores de linha, numerados do 1º (o
// mais recuado) ao 4º (o mais avançado), na ordem do elenco.
export interface Team {
  clubId: number;
  goalkeeper: Fielder;
  outfield: Fielder[];
}

export interface DuelSide {
  playerId: number;
  playerName: string;
  position: PlayerPosition;
  condition: PlayerCondition;
  attribute: AttributeName;
  value: number;
}

export interface Duel {
  order: number;
  attackingClubId: number;
  attacker: DuelSide;
  defender: DuelSide;
  goal: boolean;
}

export interface MatchOutcome {
  duels: Duel[];
  homeGoals: number;
  awayGoals: number;
  result: MatchResult;
}

// RN20: quem ataca e quem defende. O 4º jogador de linha enfrenta o goleiro,
// o 3º enfrenta o 1º, e o 2º enfrenta o 2º do adversário. Os índices abaixo
// contam a partir de zero na lista de jogadores de linha.
const GOALKEEPER = 'goalkeeper';
const PAIRINGS: { attacker: number; defender: number | typeof GOALKEEPER }[] = [
  { attacker: 3, defender: GOALKEEPER },
  { attacker: 2, defender: 0 },
  { attacker: 1, defender: 1 },
];

const WEAKENED_PERCENT = 85;

// RN20: o atacante usa o atributo da posição dele: finalização no ATA, passe
// no MEI e drible no ZAG e no LAT. O goleiro nunca ataca.
function attackAttribute(position: PlayerPosition): AttributeName {
  switch (position) {
    case 'ATA':
      return 'shooting';
    case 'MEI':
      return 'passing';
    case 'ZAG':
    case 'LAT':
      return 'dribbling';
    default:
      throw new Error('O goleiro não ataca.');
  }
}

// RN20: o titular MAL_CONDICIONADO joga com 15% a menos em cada atributo:
// atributo × 0,85, arredondado para o inteiro mais próximo, com o meio para
// cima (74 vira 63; 50 vira 43). Só vale na partida, o jogador não muda.
function effectiveValue(fielder: Fielder, attribute: AttributeName): number {
  const value = fielder.attributes[attribute];
  if (fielder.condition !== 'MAL_CONDICIONADO') {
    return value;
  }
  return Math.floor((value * WEAKENED_PERCENT + 50) / 100);
}

function toSide(fielder: Fielder, attribute: AttributeName): DuelSide {
  return {
    playerId: fielder.playerId,
    playerName: fielder.name,
    position: fielder.position,
    condition: fielder.condition,
    attribute,
    value: effectiveValue(fielder, attribute),
  };
}

// Os 3 ataques de um time contra o outro. É gol quando o valor do ataque é
// MAIOR que o da defesa: duelo empatado não é gol.
function attacksOf(
  attacking: Team,
  defending: Team,
  firstOrder: number,
): Duel[] {
  return PAIRINGS.map((pairing, index) => {
    const attacker = attacking.outfield[pairing.attacker];
    const defender =
      pairing.defender === GOALKEEPER
        ? defending.goalkeeper
        : defending.outfield[pairing.defender];
    const attack = toSide(attacker, attackAttribute(attacker.position));
    const defense = toSide(defender, 'defending');

    return {
      order: firstOrder + index,
      attackingClubId: attacking.clubId,
      attacker: attack,
      defender: defense,
      goal: attack.value > defense.value,
    };
  });
}

export function resultOf(homeGoals: number, awayGoals: number): MatchResult {
  if (homeGoals === awayGoals) {
    return 'EMPATE';
  }
  return homeGoals > awayGoals ? 'MANDANTE' : 'VISITANTE';
}

// RN20: a partida não tem sorteio. São sempre 6 duelos: os 3 ataques do
// mandante (1 a 3) e depois os 3 do visitante (4 a 6). Com os mesmos titulares
// nas mesmas condições, o resultado é sempre o mesmo.
export function playMatch(home: Team, away: Team): MatchOutcome {
  const duels = [...attacksOf(home, away, 1), ...attacksOf(away, home, 4)];
  const homeGoals = duels.filter(
    (d) => d.attackingClubId === home.clubId && d.goal,
  ).length;
  const awayGoals = duels.filter(
    (d) => d.attackingClubId === away.clubId && d.goal,
  ).length;
  return {
    duels,
    homeGoals,
    awayGoals,
    result: resultOf(homeGoals, awayGoals),
  };
}

// Monta o time a partir dos 5 titulares: ordena pela ordem do elenco (GOL,
// ZAG, LAT, MEI, ATA, depois nome e id). O primeiro é o goleiro, e os outros 4
// são os jogadores de linha, do mais recuado ao mais avançado.
export function buildTeam(clubId: number, starters: Fielder[]): Team {
  const ordered = [...starters].sort((a, b) =>
    compareSquadOrder(
      { id: a.playerId, name: a.name, position: a.position },
      { id: b.playerId, name: b.name, position: b.position },
    ),
  );
  const [goalkeeper, ...outfield] = ordered;
  return { clubId, goalkeeper, outfield };
}
