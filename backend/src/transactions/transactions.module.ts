import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from '../database/entities/club.entity';
import { Player } from '../database/entities/player.entity';
import { Transaction } from '../database/entities/transaction.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Club, Player])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
