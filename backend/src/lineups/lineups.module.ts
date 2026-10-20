import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from '../database/entities/club.entity';
import { Lineup } from '../database/entities/lineup.entity';
import { Player } from '../database/entities/player.entity';
import { LineupsController } from './lineups.controller';
import { LineupsService } from './lineups.service';

@Module({
  imports: [TypeOrmModule.forFeature([Club, Lineup, Player])],
  controllers: [LineupsController],
  providers: [LineupsService],
})
export class LineupsModule {}
