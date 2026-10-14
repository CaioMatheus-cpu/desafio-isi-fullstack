import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { Lineup } from '../database/entities/lineup.entity';
import { Player } from '../database/entities/player.entity';
import { calculateBaseValue } from './domain/base-value';
import { calculateOverall } from './domain/overall';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerResponse, toPlayerResponse } from './player.mapper';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly players: Repository<Player>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreatePlayerDto): Promise<PlayerResponse> {
    // O valor base é calculado UMA vez, aqui, e gravado. Depois disso o
    // jogador pode mudar de posição ou de idade, mas o valor base fica.
    const overall = calculateOverall(dto.position, dto);
    const baseValue = calculateBaseValue(overall, dto.potential, dto.age);

    const player = await this.players.save(
      this.players.create({
        name: dto.name,
        position: dto.position,
        agility: dto.agility,
        age: dto.age,
        pace: dto.pace,
        shooting: dto.shooting,
        passing: dto.passing,
        dribbling: dto.dribbling,
        defending: dto.defending,
        physical: dto.physical,
        potential: dto.potential,
        baseValue: baseValue.toFixed(2),
        condition: 'APTO',
        clubId: null,
      }),
    );
    return toPlayerResponse(player);
  }

  async findOne(id: number): Promise<PlayerResponse> {
    return toPlayerResponse(await this.getActivePlayer(id));
  }

  async update(id: number, dto: UpdatePlayerDto): Promise<PlayerResponse> {
    const player = await this.getActivePlayer(id);

    if (player.clubId !== null && dto.position !== player.position) {
      throw new ConflictException(
        'Jogador com clube não pode mudar de posição.',
      );
    }
    if (dto.age < player.age) {
      throw new ConflictException('A idade não pode ser menor que a atual.');
    }

    player.name = dto.name;
    player.position = dto.position;
    player.agility = dto.agility;
    player.age = dto.age;
    return toPlayerResponse(await this.players.save(player));
  }

  async updateCondition(
    id: number,
    dto: UpdateConditionDto,
  ): Promise<PlayerResponse> {
    const player = await this.getActivePlayer(id);

    if (player.condition === dto.condition) {
      return toPlayerResponse(player);
    }
    if (player.condition === 'DOENTE' && dto.condition === 'APTO') {
      throw new ConflictException(
        'Jogador DOENTE não pode voltar direto para APTO.',
      );
    }

    // Quem fica DOENTE sai da escalação. As duas coisas acontecem juntas
    // ou não acontece nenhuma.
    player.condition = dto.condition;
    await this.dataSource.transaction(async (manager) => {
      await manager.save(player);
      if (dto.condition === 'DOENTE') {
        await manager.delete(Lineup, { playerId: id });
      }
    });
    return toPlayerResponse(player);
  }

  async remove(id: number): Promise<void> {
    const player = await this.getActivePlayer(id);

    if (player.clubId !== null) {
      throw new ConflictException(
        'Só jogador livre pode ser excluído; este está no elenco de um clube.',
      );
    }

    // Exclusão lógica: nada some do banco, só ganha a data da exclusão.
    player.deletedAt = new Date();
    await this.players.save(player);
  }

  // Jogador excluído conta como inexistente em todo o sistema.
  private async getActivePlayer(id: number): Promise<Player> {
    const player = await this.players.findOneBy({ id, deletedAt: IsNull() });
    if (!player) {
      throw new NotFoundException('Jogador não encontrado.');
    }
    return player;
  }
}
