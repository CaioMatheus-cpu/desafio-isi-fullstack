import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from '../database/entities/club.entity';
import { MatchDuel } from '../database/entities/match-duel.entity';
import { Match } from '../database/entities/match.entity';
import { MatchesController, StandingsController } from './matches.controller';
import { MatchesService } from './matches.service';
import { StandingsService } from './standings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Match, MatchDuel, Club])],
  controllers: [MatchesController, StandingsController],
  providers: [MatchesService, StandingsService],
})
export class MatchesModule {}
