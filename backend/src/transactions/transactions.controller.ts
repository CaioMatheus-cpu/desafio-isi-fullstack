import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ListTransactionsQueryPipe } from './query/list-transactions-query.pipe';
import type { ListTransactionsQuery } from './query/list-transactions.query';
import { TransactionsPage } from './transaction.mapper';
import { TransactionsService } from './transactions.service';

@Controller('clubs')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get(':id/transactions')
  list(
    @Param('id', ParseIdPipe) id: number,
    @Query(ListTransactionsQueryPipe) query: ListTransactionsQuery,
  ): Promise<TransactionsPage> {
    return this.transactionsService.list(id, query);
  }

  // O arquivo é texto CSV em UTF-8. O tipo só é definido quando o arquivo
  // está pronto: se algo der errado antes, o erro sai em JSON, como nas outras
  // rotas, em vez de herdar o tipo do arquivo.
  @Get(':id/transactions/export')
  async exportCsv(
    @Param('id', ParseIdPipe) id: number,
    @Query(ListTransactionsQueryPipe) query: ListTransactionsQuery,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    const csv = await this.transactionsService.exportCsv(id, query);
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="transacoes-clube-${id}.csv"`,
    );
    return csv;
  }
}
