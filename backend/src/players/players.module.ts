import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from '../database/entities/club.entity';
import { Player } from '../database/entities/player.entity';
import { PlayersListingRepository } from './listing/players-listing.repository';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
  imports: [TypeOrmModule.forFeature([Player, Club])],
  controllers: [PlayersController],
  providers: [PlayersService, PlayersListingRepository],
})
export class PlayersModule {}
