import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from '../database/entities/club.entity';
import { Match } from '../database/entities/match.entity';
import { calculateStandings } from './domain/standings';

export interface StandingResponse {
  position: number;
  club_id: number;
  club_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

@Injectable()
export class StandingsService {
  constructor(
    @InjectRepository(Club)
    private readonly clubs: Repository<Club>,
    @InjectRepository(Match)
    private readonly matches: Repository<Match>,
  ) {}

  // A classificação nunca é gravada: sai das partidas, a cada consulta.
  async list(): Promise<StandingResponse[]> {
    const [clubs, matches] = await Promise.all([
      this.clubs.find(),
      this.matches.find(),
    ]);

    return calculateStandings(
      clubs.map((club) => ({ id: club.id, name: club.name })),
      matches,
    ).map((row) => ({
      position: row.position,
      club_id: row.clubId,
      club_name: row.clubName,
      played: row.played,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      goals_for: row.goalsFor,
      goals_against: row.goalsAgainst,
      goal_difference: row.goalDifference,
      points: row.points,
    }));
  }
}
