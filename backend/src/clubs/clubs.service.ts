import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  IsNull,
  Not,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { Clock } from '../common/clock';
import { compareText, nameSortKey } from '../common/text';
import { Club } from '../database/entities/club.entity';
import { Contract } from '../database/entities/contract.entity';
import { Player } from '../database/entities/player.entity';
import { compareSquadOrder, SquadMember } from '../players/domain/squad-order';
import { PlayerPosition } from '../players/domain/player.types';
import { toCents } from '../players/domain/rounding';
import {
  calculateNetWorthCents,
  calculateSquadValueCents,
} from './club-finance';
import {
  ClubDetailResponse,
  ClubResponse,
  toClubResponse,
  toSquadPlayerResponse,
} from './club.mapper';
import { MAX_CLUBS } from './domain/club-limits';
import { CreateClubDto } from './dto/create-club.dto';
import { ListClubsQuery } from './query/list-clubs.query';

const UNIQUE_VIOLATION = '23505';
// Chave do cadeado que impede dois clubes serem criados ao mesmo tempo e
// furarem o limite de 20.
const CLUB_CREATION_LOCK = 4201;

interface ClubWithWorth {
  club: Club;
  squadValueCents: number;
  netWorthCents: number;
}

@Injectable()
export class ClubsService {
  constructor(
    @InjectRepository(Club)
    private readonly clubs: Repository<Club>,
    @InjectRepository(Player)
    private readonly players: Repository<Player>,
    @InjectRepository(Contract)
    private readonly contracts: Repository<Contract>,
    private readonly dataSource: DataSource,
    private readonly clock: Clock,
  ) {}

  async create(dto: CreateClubDto): Promise<ClubResponse> {
    try {
      const club = await this.dataSource.transaction((manager) =>
        this.createClub(manager, dto),
      );
      return toClubResponse(club, 0);
    } catch (error) {
      // Rede de proteção: se duas criações chegarem juntas, o banco ainda
      // garante que nome e sigla não se repetem.
      if (this.isUniqueViolation(error)) {
        throw new ConflictException(
          'Já existe um clube com este nome ou sigla.',
        );
      }
      throw error;
    }
  }

  // Os clubes são poucos (no máximo 20, com até 12 jogadores cada), então o
  // patrimônio é calculado aqui, com a mesma função de valor de mercado de
  // todo o sistema, em vez de repetir a fórmula em SQL.
  async list(query: ListClubsQuery): Promise<ClubResponse[]> {
    const clubs = await this.clubs.find();
    const players = await this.players.find({
      where: { clubId: Not(IsNull()), deletedAt: IsNull() },
    });

    const rows: ClubWithWorth[] = clubs.map((club) => {
      const squad = players.filter((player) => player.clubId === club.id);
      const squadValueCents = calculateSquadValueCents(squad);
      return {
        club,
        squadValueCents,
        netWorthCents: calculateNetWorthCents(
          toCents(Number(club.cash)),
          squadValueCents,
        ),
      };
    });

    return rows
      .sort((a, b) => this.compareRows(a, b, query))
      .map((row) => toClubResponse(row.club, row.squadValueCents));
  }

  async findOne(id: number): Promise<ClubDetailResponse> {
    const club = await this.clubs.findOneBy({ id });
    if (!club) {
      throw new NotFoundException('Clube não encontrado.');
    }

    const players = await this.players.find({
      where: { clubId: id, deletedAt: IsNull() },
    });
    const contracts = await this.contracts.find({
      where: { clubId: id, status: 'ATIVO' },
    });
    const contractByPlayer = new Map(
      contracts.map((contract) => [contract.playerId, contract]),
    );

    const now = this.clock.now();
    const squad = players
      .sort((a, b) =>
        compareSquadOrder(this.asSquadMember(a), this.asSquadMember(b)),
      )
      .map((player) =>
        toSquadPlayerResponse(player, contractByPlayer.get(player.id), now),
      );

    return {
      ...toClubResponse(club, calculateSquadValueCents(players)),
      players: squad,
    };
  }

  private async createClub(
    manager: EntityManager,
    dto: CreateClubDto,
  ): Promise<Club> {
    await manager.query('SELECT pg_advisory_xact_lock($1)', [
      CLUB_CREATION_LOCK,
    ]);

    if ((await manager.count(Club)) >= MAX_CLUBS) {
      throw new ConflictException(
        `A liga aceita no máximo ${MAX_CLUBS} clubes.`,
      );
    }

    // O nome é único ignorando maiúsculas e minúsculas, mas diferenciando
    // acentos (RN10): "Águias FC" e "águias fc" colidem, "Aguias FC" não.
    const nameTaken = await manager
      .createQueryBuilder(Club, 'club')
      .where('LOWER(club.name) = LOWER(:name)', { name: dto.name })
      .getExists();
    if (nameTaken) {
      throw new ConflictException('Já existe um clube com este nome.');
    }
    if (await manager.existsBy(Club, { acronym: dto.acronym })) {
      throw new ConflictException('Já existe um clube com esta sigla.');
    }

    const saved = await manager.save(
      manager.create(Club, { name: dto.name, acronym: dto.acronym }),
    );
    // Recarrega para trazer o caixa inicial, que é o padrão do banco.
    return manager.findOneByOrFail(Club, { id: saved.id });
  }

  private asSquadMember(player: Player): SquadMember {
    return {
      id: player.id,
      name: player.name,
      position: player.position as PlayerPosition,
    };
  }

  // RN11: o empate em qualquer ordenação se desfaz pelo nome e depois pelo id.
  private compareRows(
    a: ClubWithWorth,
    b: ClubWithWorth,
    query: ListClubsQuery,
  ): number {
    const byNetWorth = a.netWorthCents - b.netWorthCents;
    const primary =
      query.sort === 'net_worth_asc'
        ? byNetWorth
        : query.sort === 'net_worth_desc'
          ? -byNetWorth
          : 0;
    return (
      primary ||
      compareText(nameSortKey(a.club.name), nameSortKey(b.club.name)) ||
      a.club.id - b.club.id
    );
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string }).code === UNIQUE_VIOLATION
    );
  }
}
