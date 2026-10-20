import { Injectable, PipeTransform } from '@nestjs/common';
import {
  ListTransactionsQuery,
  parseListTransactionsQuery,
} from './list-transactions.query';

@Injectable()
export class ListTransactionsQueryPipe implements PipeTransform<
  Record<string, unknown>,
  ListTransactionsQuery
> {
  transform(value: Record<string, unknown>): ListTransactionsQuery {
    return parseListTransactionsQuery(value);
  }
}
