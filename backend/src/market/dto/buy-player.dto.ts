import { IsInt, IsString, Max, Min, Validate } from 'class-validator';
import { BrasiliaDateTimeConstraint } from '../validation/loyalty-until.constraint';

const MAX_ID = 2147483647;

// Os nomes dos campos são os do enunciado (snake_case).
export class BuyPlayerDto {
  @IsInt()
  @Min(1)
  @Max(MAX_ID)
  club_id: number;

  @IsString()
  @Validate(BrasiliaDateTimeConstraint)
  loyalty_until: string;
}
