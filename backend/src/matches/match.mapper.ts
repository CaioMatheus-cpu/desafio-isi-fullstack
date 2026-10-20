import { formatBrasiliaDateTime } from '../common/brasilia-time';
import { Club } from '../database/entities/club.entity';
import { MatchDuel } from '../database/entities/match-duel.entity';
import { Match } from '../database/entities/match.entity';
import { resultOf, MatchResult } from './domain/match-engine';

interface SideResponse {
  club_id: number;
  club_name: string;
  formation: string;
  goals: number;
}

interface DuelSideResponse {
  player_id: number;
  player_name: string;
  position: string;
  condition: string;
  attribute: string;
  value: number;
}

export interface DuelResponse {
  order: number;
  attacking_club_id: number;
  attacker: DuelSideResponse;
  defender: DuelSideResponse;
  goal: boolean;
}

export interface MatchSummaryResponse {
  id: number;
  played_at: string;
  home: SideResponse;
  away: SideResponse;
  result: MatchResult;
}

export interface MatchResponse extends MatchSummaryResponse {
  duels: DuelResponse[];
}

// A partida sem os duelos: é o item do histórico de partidas.
export function toMatchSummary(
  match: Match,
  home: Club,
  away: Club,
): MatchSummaryResponse {
  return {
    id: match.id,
    played_at: formatBrasiliaDateTime(match.playedAt),
    home: {
      club_id: home.id,
      club_name: home.name,
      formation: match.homeFormation,
      goals: match.homeGoals,
    },
    away: {
      club_id: away.id,
      club_name: away.name,
      formation: match.awayFormation,
      goals: match.awayGoals,
    },
    result: resultOf(match.homeGoals, match.awayGoals),
  };
}

// A partida com os 6 duelos, na ordem de 1 a 6. Tudo vem como foi gravado na
// hora da partida (nomes, posições, condições e valores), nunca recalculado.
export function toMatchResponse(
  match: Match,
  home: Club,
  away: Club,
  duels: MatchDuel[],
): MatchResponse {
  return {
    ...toMatchSummary(match, home, away),
    duels: [...duels]
      .sort((a, b) => a.duelOrder - b.duelOrder)
      .map((duel) => ({
        order: duel.duelOrder,
        attacking_club_id: duel.attackingClubId,
        attacker: {
          player_id: duel.attackerId,
          player_name: duel.attackerName,
          position: duel.attackerPosition,
          condition: duel.attackerCondition,
          attribute: duel.attackAttribute,
          value: duel.attackValue,
        },
        defender: {
          player_id: duel.defenderId,
          player_name: duel.defenderName,
          position: duel.defenderPosition,
          condition: duel.defenderCondition,
          attribute: duel.defenseAttribute,
          value: duel.defenseValue,
        },
        goal: duel.goal,
      })),
  };
}
