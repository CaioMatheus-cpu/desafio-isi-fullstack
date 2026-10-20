import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, IsNull, Repository } from 'typeorm';
import { Clock } from '../common/clock';
import { Club } from '../database/entities/club.entity';
import { Lineup } from '../database/entities/lineup.entity';
import { MatchDuel } from '../database/entities/match-duel.entity';
import { Match } from '../database/entities/match.entity';
import { Player } from '../database/entities/player.entity';
import {
  Formation,
  fitsFormation,
  LINEUP_SIZE,
} from '../lineups/domain/formations';
import {
  PlayerCondition,
  PlayerPosition,
} from '../players/domain/player.types';
import { buildTeam, Fielder, playMatch, Team } from './domain/match-engine';
import { CreateMatchDto } from './dto/create-match.dto';
import {
  MatchResponse,
  MatchSummaryResponse,
  toMatchResponse,
  toMatchSummary,
} from './match.mapper';
import { ListMatchesQuery } from './query/list-matches.query';

interface ReadyTeam {
  team: Team;
  formation: Formation;
}

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matches: Repository<Match>,
    @InjectRepository(MatchDuel)
    private readonly duels: Repository<MatchDuel>,
    @InjectRepository(Club)
    private readonly clubs: Repository<Club>,
    private readonly dataSource: DataSource,
    private readonly clock: Clock,
  ) {}

  // A partida é jogada na hora e gravada numa única operação: a partida e os
  // 6 duelos entram juntos ou não entra nada. Ela não mexe no caixa, na
  // escalação nem nos jogadores.
  async create(dto: CreateMatchDto): Promise<MatchResponse> {
    const now = this.clock.now();
    const matchId = await this.dataSource.transaction((manager) =>
      this.play(manager, dto, now),
    );
    return this.findOne(matchId);
  }

  async findOne(id: number): Promise<MatchResponse> {
    const match = await this.matches.findOneBy({ id });
    if (!match) {
      throw new NotFoundException('Partida não encontrada.');
    }
    const clubs = await this.clubsById([match.homeClubId, match.awayClubId]);
    const duels = await this.duels.findBy({ matchId: id });
    return toMatchResponse(
      match,
      clubs.get(match.homeClubId) as Club,
      clubs.get(match.awayClubId) as Club,
      duels,
    );
  }

  // Da partida mais recente para a mais antiga (no mesmo instante, o maior
  // id primeiro). Com club_id, só as partidas em que o clube jogou.
  async list(query: ListMatchesQuery): Promise<MatchSummaryResponse[]> {
    if (
      query.clubId !== undefined &&
      !(await this.clubs.existsBy({ id: query.clubId }))
    ) {
      throw new NotFoundException('Clube não encontrado.');
    }

    const where =
      query.clubId === undefined
        ? undefined
        : [{ homeClubId: query.clubId }, { awayClubId: query.clubId }];
    const found = await this.matches.find({
      where,
      order: { playedAt: 'DESC', id: 'DESC' },
    });

    const clubs = await this.clubsById(
      found.flatMap((match) => [match.homeClubId, match.awayClubId]),
    );
    return found.map((match) =>
      toMatchSummary(
        match,
        clubs.get(match.homeClubId) as Club,
        clubs.get(match.awayClubId) as Club,
      ),
    );
  }

  private async play(
    manager: EntityManager,
    dto: CreateMatchDto,
    now: Date,
  ): Promise<number> {
    const home = await this.findClub(manager, dto.home_club_id);
    const away = await this.findClub(manager, dto.away_club_id);
    const homeSquad = await this.loadTeam(manager, home);
    const awaySquad = await this.loadTeam(manager, away);

    const outcome = playMatch(homeSquad.team, awaySquad.team);

    const match = await manager.save(
      manager.create(Match, {
        homeClubId: home.id,
        awayClubId: away.id,
        homeGoals: outcome.homeGoals,
        awayGoals: outcome.awayGoals,
        homeFormation: homeSquad.formation,
        awayFormation: awaySquad.formation,
        playedAt: now,
      }),
    );
    await manager.insert(
      MatchDuel,
      outcome.duels.map((duel) => ({
        matchId: match.id,
        duelOrder: duel.order,
        attackingClubId: duel.attackingClubId,
        attackerId: duel.attacker.playerId,
        defenderId: duel.defender.playerId,
        attackerName: duel.attacker.playerName,
        defenderName: duel.defender.playerName,
        attackerPosition: duel.attacker.position,
        defenderPosition: duel.defender.position,
        attackerCondition: duel.attacker.condition,
        defenderCondition: duel.defender.condition,
        attackAttribute: duel.attacker.attribute,
        defenseAttribute: duel.defender.attribute,
        attackValue: duel.attacker.value,
        defenseValue: duel.defender.value,
        goal: duel.goal,
      })),
    );
    return match.id;
  }

  private async findClub(manager: EntityManager, id: number): Promise<Club> {
    const club = await manager.findOneBy(Club, { id });
    if (!club) {
      throw new NotFoundException('Clube não encontrado.');
    }
    return club;
  }

  // O clube só joga com a escalação completa: a formação e os 5 titulares,
  // fechando a formação. Quem nunca escalou, ou perdeu um titular por venda
  // ou por doença e não escalou de novo, não joga (409).
  private async loadTeam(
    manager: EntityManager,
    club: Club,
  ): Promise<ReadyTeam> {
    const incomplete = new ConflictException(
      `O clube ${club.name} não tem a escalação completa.`,
    );
    const rows = await manager.findBy(Lineup, { clubId: club.id });
    if (!club.formation || rows.length !== LINEUP_SIZE) {
      throw incomplete;
    }

    const starters = await manager.find(Player, {
      where: { id: In(rows.map((row) => row.playerId)), deletedAt: IsNull() },
    });
    const positions = starters.map(
      (player) => player.position as PlayerPosition,
    );
    const formation = club.formation as Formation;
    if (
      starters.length !== LINEUP_SIZE ||
      !fitsFormation(positions, formation)
    ) {
      throw incomplete;
    }

    return {
      team: buildTeam(
        club.id,
        starters.map((player) => this.toFielder(player)),
      ),
      formation,
    };
  }

  private toFielder(player: Player): Fielder {
    return {
      playerId: player.id,
      name: player.name,
      position: player.position as PlayerPosition,
      condition: player.condition as PlayerCondition,
      attributes: {
        pace: player.pace,
        shooting: player.shooting,
        passing: player.passing,
        dribbling: player.dribbling,
        defending: player.defending,
        physical: player.physical,
      },
    };
  }

  private async clubsById(ids: number[]): Promise<Map<number, Club>> {
    const found = ids.length
      ? await this.clubs.findBy({ id: In([...new Set(ids)]) })
      : [];
    return new Map(found.map((club) => [club.id, club]));
  }
}
