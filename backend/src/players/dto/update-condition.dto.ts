import { IsIn } from 'class-validator';
import { PLAYER_CONDITIONS } from '../domain/player.types';
import type { PlayerCondition } from '../domain/player.types';

export class UpdateConditionDto {
  @IsIn(PLAYER_CONDITIONS)
  condition: PlayerCondition;
}
