import { Injectable, PipeTransform } from '@nestjs/common';
import { ListPlayersQuery, parseListPlayersQuery } from './list-players.query';

@Injectable()
export class ListPlayersQueryPipe implements PipeTransform<
  Record<string, unknown>,
  ListPlayersQuery
> {
  transform(value: Record<string, unknown>): ListPlayersQuery {
    return parseListPlayersQuery(value);
  }
}
