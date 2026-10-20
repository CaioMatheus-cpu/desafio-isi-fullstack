import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  Max,
  Min,
} from 'class-validator';
import { MAX_ID } from '../../common/query-params';
import { FORMATIONS, LINEUP_SIZE } from '../domain/formations';
import type { Formation } from '../domain/formations';

// Os nomes dos campos são os do enunciado (snake_case).
export class SetLineupDto {
  @IsIn(FORMATIONS)
  formation: Formation;

  // Exatamente 5 ids, distintos e inteiros positivos, em qualquer ordem.
  @IsArray()
  @ArrayMinSize(LINEUP_SIZE)
  @ArrayMaxSize(LINEUP_SIZE)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(MAX_ID, { each: true })
  player_ids: number[];
}
