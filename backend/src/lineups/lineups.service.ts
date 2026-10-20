import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, IsNull, Repository } from 'typeorm';
import { LOCK_FOR_UPDATE } from '../common/locks';
import { Club } from '../database/entities/club.entity';
import { Lineup } from '../database/entities/lineup.entity';
import { Player } from '../database/entities/player.entity';
import { PlayerPosition } from '../players/domain/player.types';
import { compareSquadOrder, SquadMember } from '../players/domain/squad-order';
import { PlayerResponse, toPlayerResponse } from '../players/player.mapper';
import { Formation, fitsFormation, LINEUP_SIZE } from './domain/formations';
import { SetLineupDto } from './dto/set-lineup.dto';

export interface LineupResponse {
  club_id: number;
  formation: Formation | null;
  complete: boolean;
  players: PlayerResponse[];
}

@Injectable()
export class LineupsService {
  constructor(
    @InjectRepository(Club)
    private readonly clubs: Repository<Club>,
    @InjectRepository(Lineup)
    private readonly lineups: Repository<Lineup>,
    @InjectRepository(Player)
    private readonly players: Repository<Player>,
    private readonly dataSource: DataSource,
  ) {}

  // Substitui a escalação INTEIRA numa única operação: ou grava a formação e
  // os 5 titulares, ou não grava nada. Escalar não mexe no caixa.
  async set(clubId: number, dto: SetLineupDto): Promise<LineupResponse> {
    await this.dataSource.transaction(async (manager) => {
      const club = await manager.findOne(Club, {
        where: { id: clubId },
        lock: LOCK_FOR_UPDATE,
      });
      if (!club) {
        throw new NotFoundException('Clube não encontrado.');
      }

      const starters = await this.loadStarters(manager, dto.player_ids);
      this.assertValidLineup(club, starters, dto.formation);

      await manager.delete(Lineup, { clubId });
      await manager.insert(
        Lineup,
        starters.map((player) => ({ clubId, playerId: player.id })),
      );
      await manager.update(Club, { id: clubId }, { formation: dto.formation });
    });
    return this.get(clubId);
  }

  // Sem escalação: formação nula, ninguém na lista e complete falso. Com a
  // escalação incompleta (um titular foi vendido ou ficou doente), a formação
  // continua a salva e a lista traz só os titulares que sobraram.
  async get(clubId: number): Promise<LineupResponse> {
    const club = await this.clubs.findOneBy({ id: clubId });
    if (!club) {
      throw new NotFoundException('Clube não encontrado.');
    }

    const rows = await this.lineups.findBy({ clubId });
    const starters = rows.length
      ? await this.players.findBy({
          id: In(rows.map((row) => row.playerId)),
          deletedAt: IsNull(),
        })
      : [];
    starters.sort((a, b) =>
      compareSquadOrder(this.asSquadMember(a), this.asSquadMember(b)),
    );

    return {
      club_id: club.id,
      formation: club.formation as Formation | null,
      complete: starters.length === LINEUP_SIZE,
      players: starters.map(toPlayerResponse),
    };
  }

  // Jogador inexistente (ou excluído) é 404.
  private async loadStarters(
    manager: EntityManager,
    playerIds: number[],
  ): Promise<Player[]> {
    const starters = await manager.find(Player, {
      where: { id: In(playerIds), deletedAt: IsNull() },
    });
    if (starters.length !== playerIds.length) {
      throw new NotFoundException('Jogador não encontrado.');
    }
    return starters;
  }

  // As regras que dependem do estado atual são 409: cada titular precisa ser
  // do elenco do clube e não estar doente, e as posições precisam fechar a
  // formação (1 goleiro e os jogadores de linha de cada setor).
  private assertValidLineup(
    club: Club,
    starters: Player[],
    formation: Formation,
  ): void {
    if (starters.some((player) => player.clubId !== club.id)) {
      throw new ConflictException('Há jogador que não é do elenco do clube.');
    }
    if (starters.some((player) => player.condition === 'DOENTE')) {
      throw new ConflictException('Jogador DOENTE não pode ser escalado.');
    }
    const positions = starters.map(
      (player) => player.position as PlayerPosition,
    );
    if (!fitsFormation(positions, formation)) {
      throw new ConflictException(
        `As posições dos titulares não fecham a formação ${formation}.`,
      );
    }
  }

  private asSquadMember(player: Player): SquadMember {
    return {
      id: player.id,
      name: player.name,
      position: player.position as PlayerPosition,
    };
  }
}
