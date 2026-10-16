import { Injectable, PipeTransform } from '@nestjs/common';
import { ListClubsQuery, parseListClubsQuery } from './list-clubs.query';

@Injectable()
export class ListClubsQueryPipe implements PipeTransform<
  Record<string, unknown>,
  ListClubsQuery
> {
  transform(value: Record<string, unknown>): ListClubsQuery {
    return parseListClubsQuery(value);
  }
}
