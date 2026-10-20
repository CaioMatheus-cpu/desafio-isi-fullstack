import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { formatBrasiliaDateTime } from '../common/brasilia-time';
import { Clock } from '../common/clock';
import { LOCK_FOR_UPDATE } from '../common/locks';
import { Club } from '../database/entities/club.entity';
import { Contract } from '../database/entities/contract.entity';
import { Lineup } from '../database/entities/lineup.entity';
import { Player } from '../database/entities/player.entity';
import { Transaction } from '../database/entities/transaction.entity';
import {
  centsToDecimalString,
  fromCents,
  toCents,
} from '../players/domain/rounding';
import { playerMarketValueCents } from '../players/player-pricing';
import { remainingDays } from './domain/loyalty';
import { calculateSale } from './domain/sale';

export interface SaleResponse {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: 'VENDA';
  value: number;
  fee: number;
  penalty: number;
  profit: number;
  cash_change: number;
  created_at: string;
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: 'RESCINDIDO' | 'ENCERRADO';
  club_cash: number;
}

@Injectable()
export class SalesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly clock: Clock,
  ) {}

  // A venda é sempre feita pelo clube atual do jogador, e o jogador volta a
  // ficar livre. Tudo acontece numa transação: caixa, jogador, contrato,
  // transação de venda e saída da escalação.
  async sell(playerId: number): Promise<SaleResponse> {
    const now = this.clock.now();
    return this.dataSource.transaction((manager) =>
      this.executeSale(manager, playerId, now),
    );
  }

  private async executeSale(
    manager: EntityManager,
    playerId: number,
    now: Date,
  ): Promise<SaleResponse> {
    const player = await manager.findOne(Player, {
      where: { id: playerId, deletedAt: IsNull() },
      lock: LOCK_FOR_UPDATE,
    });
    if (!player) {
      throw new NotFoundException('Jogador não encontrado.');
    }
    if (player.clubId === null) {
      throw new ConflictException('Jogador livre não pode ser vendido.');
    }

    const club = await manager.findOneOrFail(Club, {
      where: { id: player.clubId },
      lock: LOCK_FOR_UPDATE,
    });
    const contract = await manager.findOneByOrFail(Contract, {
      playerId: player.id,
      clubId: club.id,
      status: 'ATIVO',
    });

    // O preço da venda é o valor de mercado de agora, não o da compra.
    const days = remainingDays(contract.loyaltyUntil, now);
    const marketValueCents = playerMarketValueCents(player);
    const sale = calculateSale({
      marketValueCents,
      purchaseValueCents: toCents(Number(contract.purchaseValue)),
      remainingDays: days,
    });
    const newCashCents = toCents(Number(club.cash)) + sale.creditCents;
    // Com multa o contrato é rescindido; sem multa, a fidelidade foi cumprida.
    const contractStatus = sale.penaltyCents > 0 ? 'RESCINDIDO' : 'ENCERRADO';

    await manager.update(
      Club,
      { id: club.id },
      { cash: centsToDecimalString(newCashCents) },
    );
    await manager.update(Player, { id: player.id }, { clubId: null });
    await manager.update(
      Contract,
      { id: contract.id },
      { status: contractStatus, endedAt: now },
    );
    // Quem é vendido deixa a escalação; a formação fica, e o clube só volta
    // a jogar quando escalar de novo.
    await manager.delete(Lineup, { playerId: player.id });

    const transaction = await manager.save(
      manager.create(Transaction, {
        clubId: club.id,
        playerId: player.id,
        playerName: player.name,
        type: 'VENDA',
        value: centsToDecimalString(marketValueCents),
        fee: centsToDecimalString(sale.commissionCents),
        penalty: centsToDecimalString(sale.penaltyCents),
        profit: centsToDecimalString(sale.profitCents),
        cashChange: centsToDecimalString(sale.creditCents),
        createdAt: now,
      }),
    );

    return {
      id: transaction.id,
      club_id: club.id,
      player_id: player.id,
      player_name: player.name,
      type: 'VENDA',
      value: fromCents(marketValueCents),
      fee: fromCents(sale.commissionCents),
      penalty: fromCents(sale.penaltyCents),
      profit: fromCents(sale.profitCents),
      cash_change: fromCents(sale.creditCents),
      created_at: formatBrasiliaDateTime(now),
      purchase_value: Number(contract.purchaseValue),
      remaining_days: days,
      penalty_rate: sale.penaltyRatePercent,
      contract_status: contractStatus,
      club_cash: fromCents(newCashCents),
    };
  }
}
