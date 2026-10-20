import { IsInt, Max, Min, Validate } from 'class-validator';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { MAX_ID } from '../../common/query-params';

// O mandante e o visitante não podem ser o mesmo clube.
@ValidatorConstraint({ name: 'differentClubs' })
export class DifferentClubsConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const home = (args.object as { home_club_id?: unknown }).home_club_id;
    return !(Number.isInteger(home) && value === home);
  }

  defaultMessage(): string {
    return 'home_club_id e away_club_id não podem ser o mesmo clube';
  }
}

// Os nomes dos campos são os do enunciado (snake_case).
export class CreateMatchDto {
  @IsInt()
  @Min(1)
  @Max(MAX_ID)
  home_club_id: number;

  @IsInt()
  @Min(1)
  @Max(MAX_ID)
  @Validate(DifferentClubsConstraint)
  away_club_id: number;
}
