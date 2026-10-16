import { Club } from '../database/entities/club.entity';
import { Contract } from '../database/entities/contract.entity';
import { Player } from '../database/entities/player.entity';
import { formatBrasiliaDateTime } from '../common/brasilia-time';
import { penaltyRatePercent, remainingDays } from '../market/domain/loyalty';
import { PlayerResponse, toPlayerResponse } from '../players/player.mapper';
import { fromCents, toCents } from '../players/domain/rounding';
import { calculateNetWorthCents } from './club-finance';

export interface ClubResponse {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

export interface ContractResponse {
  purchase_value: number;
  loyalty_until: string;
  remaining_days: number;
  penalty_rate: number;
}

export interface SquadPlayerResponse extends PlayerResponse {
  contract: ContractResponse | null;
}

export interface ClubDetailResponse extends ClubResponse {
  players: SquadPlayerResponse[];
}

export function toClubResponse(
  club: Club,
  squadValueCents: number,
): ClubResponse {
  const cashCents = toCents(Number(club.cash));
  return {
    id: club.id,
    name: club.name,
    acronym: club.acronym,
    cash: fromCents(cashCents),
    squad_value: fromCents(squadValueCents),
    net_worth: fromCents(calculateNetWorthCents(cashCents, squadValueCents)),
  };
}

// Contrato do jogador no elenco: os dias restantes e o percentual da multa
// são calculados agora, com o relógio do servidor, e nunca gravados (RN11).
export function toSquadPlayerResponse(
  player: Player,
  contract: Contract | undefined,
  now: Date,
): SquadPlayerResponse {
  if (!contract) {
    return { ...toPlayerResponse(player), contract: null };
  }
  const days = remainingDays(contract.loyaltyUntil, now);
  return {
    ...toPlayerResponse(player),
    contract: {
      purchase_value: Number(contract.purchaseValue),
      loyalty_until: formatBrasiliaDateTime(contract.loyaltyUntil),
      remaining_days: days,
      penalty_rate: penaltyRatePercent(days),
    },
  };
}
