import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsString, Max, Min, Validate } from 'class-validator';
import { PLAYER_POSITIONS } from '../domain/player.types';
import type { PlayerPosition } from '../domain/player.types';
import {
  AGE_MAX,
  AGE_MIN,
  AGILITY_MAX,
  AGILITY_MIN,
} from '../validation/player-limits';
import { normalizeName } from '../validation/player-name';
import {
  AgilityWithinAgeLimitConstraint,
  PlayerNameConstraint,
} from '../validation/player.constraints';

// Campos que podem ser editados no PUT. O cadastro estende esta classe.
export class UpdatePlayerDto {
  @Transform(({ value }) => normalizeName(value))
  @IsString()
  @Validate(PlayerNameConstraint)
  name: string;

  @IsIn(PLAYER_POSITIONS)
  position: PlayerPosition;

  @IsInt()
  @Min(AGILITY_MIN)
  @Max(AGILITY_MAX)
  @Validate(AgilityWithinAgeLimitConstraint)
  agility: number;

  @IsInt()
  @Min(AGE_MIN)
  @Max(AGE_MAX)
  age: number;
}
