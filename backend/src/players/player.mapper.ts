import { Player } from '../database/entities/player.entity';
import { calculateMarketValue } from './domain/market-value';
import { calculateOverall } from './domain/overall';
import { PlayerCondition, PlayerPosition } from './domain/player.types';

export interface PlayerResponse {
  id: number;
  name: string;
  position: PlayerPosition;
  agility: number;
  age: number;
  condition: PlayerCondition;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
}

export interface PlayersPage {
  data: PlayerResponse[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

// Monta a resposta da API. O valor de mercado e o overall NÃO vêm do banco:
// são calculados aqui, na hora, com os dados atuais do jogador.
export function toPlayerResponse(player: Player): PlayerResponse {
  const condition = player.condition as PlayerCondition;
  const position = player.position as PlayerPosition;
  const baseValue = Number(player.baseValue);

  return {
    id: player.id,
    name: player.name,
    position,
    agility: player.agility,
    age: player.age,
    condition,
    base_value: baseValue,
    market_value: calculateMarketValue(
      baseValue,
      condition,
      player.agility,
      player.age,
    ),
    pace: player.pace,
    shooting: player.shooting,
    passing: player.passing,
    dribbling: player.dribbling,
    defending: player.defending,
    physical: player.physical,
    potential: player.potential,
    overall: calculateOverall(position, player),
    club_id: player.clubId,
  };
}
