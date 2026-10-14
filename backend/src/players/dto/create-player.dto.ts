import { IsInt, Max, Min, Validate } from 'class-validator';
import {
  ATTRIBUTE_MAX,
  ATTRIBUTE_MIN,
  POTENTIAL_MAX,
  POTENTIAL_MIN,
} from '../validation/player-limits';
import {
  AttributesSumLimitConstraint,
  PotentialMatchesAttributesConstraint,
} from '../validation/player.constraints';
import { UpdatePlayerDto } from './update-player.dto';

// No cadastro entram também os seis atributos e o potencial, que depois
// disso nunca mais mudam.
export class CreatePlayerDto extends UpdatePlayerDto {
  @IsInt()
  @Min(ATTRIBUTE_MIN)
  @Max(ATTRIBUTE_MAX)
  @Validate(AttributesSumLimitConstraint)
  pace: number;

  @IsInt()
  @Min(ATTRIBUTE_MIN)
  @Max(ATTRIBUTE_MAX)
  shooting: number;

  @IsInt()
  @Min(ATTRIBUTE_MIN)
  @Max(ATTRIBUTE_MAX)
  passing: number;

  @IsInt()
  @Min(ATTRIBUTE_MIN)
  @Max(ATTRIBUTE_MAX)
  dribbling: number;

  @IsInt()
  @Min(ATTRIBUTE_MIN)
  @Max(ATTRIBUTE_MAX)
  defending: number;

  @IsInt()
  @Min(ATTRIBUTE_MIN)
  @Max(ATTRIBUTE_MAX)
  physical: number;

  @IsInt()
  @Min(POTENTIAL_MIN)
  @Max(POTENTIAL_MAX)
  @Validate(PotentialMatchesAttributesConstraint)
  potential: number;
}
