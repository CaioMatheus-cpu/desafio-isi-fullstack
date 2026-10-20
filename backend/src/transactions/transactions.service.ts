import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, IsNull, Repository } from 'typeorm';
import { Club } from '../database/entities/club.entity';
import { Player } from '../database/entities/player.entity';
import { Transaction } from '../database/entities/transaction.entity';
import { summarizeTransactions } from './domain/transaction-summary';
import { buildTransactionsCsv } from './domain/transactions-csv';
import { ListTransactionsQuery } from './query/list-transactions.query';
import {
  toAmounts,
  toCsvTransaction,
  toSummaryResponse,
  toTransactionResponse,
  TransactionsPage,
} from './transaction.mapper';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactions: Repository<Transaction>,
    @InjectRepository(Club)
    private readonly clubs: Repository<Club>,
    @InjectRepository(Player)
    private readonly players: Repository<Player>,
  ) {}

  // Histórico do clube, da mais recente para a mais antiga, com os totais
  // das transações que passaram pelos filtros.
  async list(
    clubId: number,
    query: ListTransactionsQuery,
  ): Promise<TransactionsPage> {
    const found = await this.findFiltered(clubId, query);
    return {
      data: found.map(toTransactionResponse),
      summary: toSummaryResponse(summarizeTransactions(found.map(toAmounts))),
    };
  }

  // O mesmo histórico, no formato CSV, com os mesmos filtros.
  async exportCsv(
    clubId: number,
    query: ListTransactionsQuery,
  ): Promise<string> {
    const found = await this.findFiltered(clubId, query);
    return buildTransactionsCsv(found.map(toCsvTransaction));
  }

  private async findFiltered(
    clubId: number,
    query: ListTransactionsQuery,
  ): Promise<Transaction[]> {
    if (!(await this.clubs.existsBy({ id: clubId }))) {
      throw new NotFoundException('Clube não encontrado.');
    }
    // Jogador excluído conta como inexistente também neste filtro.
    if (
      query.playerId !== undefined &&
      !(await this.players.existsBy({
        id: query.playerId,
        deletedAt: IsNull(),
      }))
    ) {
      throw new NotFoundException('Jogador não encontrado.');
    }

    const where: FindOptionsWhere<Transaction> = { clubId };
    if (query.types) {
      where.type = In(query.types);
    }
    if (query.playerId !== undefined) {
      where.playerId = query.playerId;
    }
    // Empate de data e hora: o id maior (mais novo) vem primeiro.
    return this.transactions.find({
      where,
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }
}
