import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from '../database/entities/club.entity';
import { Contract } from '../database/entities/contract.entity';
import { Player } from '../database/entities/player.entity';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Club, Player, Contract])],
  controllers: [ClubsController],
  providers: [ClubsService],
})
export class ClubsModule {}
