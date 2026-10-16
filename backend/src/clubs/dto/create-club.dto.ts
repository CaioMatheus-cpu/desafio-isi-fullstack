import { Transform } from 'class-transformer';
import { IsString, Validate } from 'class-validator';
import { normalizeName } from '../../players/validation/player-name';
import {
  ClubAcronymConstraint,
  ClubNameConstraint,
} from '../validation/club.constraints';

export class CreateClubDto {
  @Transform(({ value }) => normalizeName(value))
  @IsString()
  @Validate(ClubNameConstraint)
  name: string;

  @IsString()
  @Validate(ClubAcronymConstraint)
  acronym: string;
}
