import { Injectable, PipeTransform } from '@nestjs/common';
import { ListMatchesQuery, parseListMatchesQuery } from './list-matches.query';

@Injectable()
export class ListMatchesQueryPipe implements PipeTransform<
  Record<string, unknown>,
  ListMatchesQuery
> {
  transform(value: Record<string, unknown>): ListMatchesQuery {
    return parseListMatchesQuery(value);
  }
}
