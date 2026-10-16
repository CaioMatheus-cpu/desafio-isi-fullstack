import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { MAX_SQUAD_SIZE } from '../clubs/domain/club-limits';
import {
  formatBrasiliaDateTime,
  parseBrasiliaDateTime,
} from '../common/brasilia-time';
import { Clock } from '../common/clock';
import { Club } from '../database/entities/club.entity';
import { Contract } from '../database/entities/contract.entity';
import { Player } from '../database/entities/player.entity';
import { Transaction } from '../database/entities/transaction.entity';
import {
  centsToDecimalString,
  fromCents,
  toCents,
} from '../players/domain/rounding';
import { playerMarketValueCents } from '../players/player-pricing';
import { BuyPlayerDto } from './dto/buy-player.dto';
import { loyaltyWindowError } from './domain/loyalty';
import {
  calculatePurchaseFeeCents,
  isWithinCashLimit,
} from './domain/purchase';

export interface PurchaseResponse {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: 'COMPRA';
  value: number;
  fee: number;
  penalty: number;
  profit: null;
  cash_change: number;
  created_at: string;
  contract: {
    purchase_value: number;
    loyalty_until: string;
    status: 'ATIVO';
  };
  club_cash: number;
}

interface PurchaseRequest {
  playerId: number;
  clubId: number;
  loyaltyUntil: Date;
  now: Date;
}

const LOCK_FOR_UPDATE = { mode: 'pessimistic_write' } as const;

@Injectable()
export class MarketService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly clock: Clock,
  ) {}

  async buy(playerId: number, dto: BuyPlayerDto): Promise<PurchaseResponse> {
    // Um único "agora" para a compra inteira: o prazo da fidelidade, a data
    // do contrato e a da transação usam o mesmo instante.
    const now = this.clock.now();

    const loyaltyUntil = parseBrasiliaDateTime(dto.loyalty_until);
    if (!loyaltyUntil) {
      throw new BadRequestException('loyalty_until é uma data inválida.');
    }
    const windowError = loyaltyWindowError(loyaltyUntil, now);
    if (windowError) {
      throw new BadRequestException(windowError);
    }

    // Caixa, elenco, contrato e transação: ou tudo é gravado, ou nada.
    return this.dataSource.transaction((manager) =>
      this.executePurchase(manager, {
        playerId,
        clubId: dto.club_id,
        loyaltyUntil,
        now,
      }),
    );
  }

  private async executePurchase(
    manager: EntityManager,
    request: PurchaseRequest,
  ): Promise<PurchaseResponse> {
    const { playerId, clubId, loyaltyUntil, now } = request;

    // Os dois registros ficam travados até o fim da transação. Assim duas
    // compras ao mesmo tempo não gastam o mesmo caixa nem o mesmo jogador.
    const player = await manager.findOne(Player, {
      where: { id: playerId, deletedAt: IsNull() },
      lock: LOCK_FOR_UPDATE,
    });
    if (!player) {
      throw new NotFoundException('Jogador não encontrado.');
    }
    const club = await manager.findOne(Club, {
      where: { id: clubId },
      lock: LOCK_FOR_UPDATE,
    });
    if (!club) {
      throw new NotFoundException('Clube não encontrado.');
    }

    await this.assertCanBuy(manager, player, club);

    // O preço é sempre o valor de mercado de agora, nunca o valor base.
    const valueCents = playerMarketValueCents(player);
    const feeCents = calculatePurchaseFeeCents(valueCents);
    const totalCents = valueCents + feeCents;
    const cashCents = toCents(Number(club.cash));

    if (!isWithinCashLimit(totalCents, cashCents)) {
      throw new ConflictException(
        `O custo da compra (${this.format(totalCents)}) passa do limite de 50% do caixa (${this.format(cashCents / 2)}).`,
      );
    }

    const newCashCents = cashCents - totalCents;
    await manager.update(
      Club,
      { id: club.id },
      { cash: centsToDecimalString(newCashCents) },
    );
    await manager.update(Player, { id: player.id }, { clubId: club.id });
    await manager.save(
      manager.create(Contract, {
        playerId: player.id,
        clubId: club.id,
        purchaseValue: centsToDecimalString(valueCents),
        loyaltyUntil,
        status: 'ATIVO',
        startedAt: now,
        endedAt: null,
      }),
    );
    const transaction = await manager.save(
      manager.create(Transaction, {
        clubId: club.id,
        playerId: player.id,
        playerName: player.name,
        type: 'COMPRA',
        value: centsToDecimalString(valueCents),
        fee: centsToDecimalString(feeCents),
        penalty: '0.00',
        profit: null,
        cashChange: centsToDecimalString(-totalCents),
        createdAt: now,
      }),
    );

    return {
      id: transaction.id,
      club_id: club.id,
      player_id: player.id,
      player_name: player.name,
      type: 'COMPRA',
      value: fromCents(valueCents),
      fee: fromCents(feeCents),
      penalty: 0,
      profit: null,
      cash_change: fromCents(-totalCents),
      created_at: formatBrasiliaDateTime(now),
      contract: {
        purchase_value: fromCents(valueCents),
        loyalty_until: formatBrasiliaDateTime(loyaltyUntil),
        status: 'ATIVO',
      },
      club_cash: fromCents(newCashCents),
    };
  }

  // As recusas de regra de negócio (409) que não dependem do preço.
  private async assertCanBuy(
    manager: EntityManager,
    player: Player,
    club: Club,
  ): Promise<void> {
    if (player.clubId !== null) {
      throw new ConflictException('O jogador não está livre.');
    }

    // Um clube não pode comprar de volta um jogador que ele mesmo vendeu.
    const soldBefore = await manager.existsBy(Transaction, {
      clubId: club.id,
      playerId: player.id,
      type: 'VENDA',
    });
    if (soldBefore) {
      throw new ConflictException(
        'Este clube já vendeu o jogador e não pode comprá-lo de novo.',
      );
    }

    const squadSize = await manager.countBy(Player, {
      clubId: club.id,
      deletedAt: IsNull(),
    });
    if (squadSize >= MAX_SQUAD_SIZE) {
      throw new ConflictException(
        `O elenco já tem ${MAX_SQUAD_SIZE} jogadores, o máximo permitido.`,
      );
    }
  }

  private format(cents: number): string {
    return (cents / 100).toFixed(2).replace('.', ',');
  }
}
