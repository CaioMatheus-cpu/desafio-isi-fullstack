import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Club } from './club.entity';
import { Match } from './match.entity';
import { Player } from './player.entity';

@Entity('match_duels')
export class MatchDuel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'match_id', type: 'integer' })
  matchId: number;

  @ManyToOne(() => Match)
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @Column({ name: 'duel_order', type: 'integer' })
  duelOrder: number;

  @Column({ name: 'attacking_club_id', type: 'integer' })
  attackingClubId: number;

  @ManyToOne(() => Club)
  @JoinColumn({ name: 'attacking_club_id' })
  attackingClub: Club;

  @Column({ name: 'attacker_id', type: 'integer' })
  attackerId: number;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'attacker_id' })
  attacker: Player;

  @Column({ name: 'defender_id', type: 'integer' })
  defenderId: number;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'defender_id' })
  defender: Player;

  @Column({ name: 'attacker_name', type: 'varchar', length: 100 })
  attackerName: string;

  @Column({ name: 'defender_name', type: 'varchar', length: 100 })
  defenderName: string;

  @Column({ name: 'attacker_position', type: 'varchar', length: 3 })
  attackerPosition: string;

  @Column({ name: 'defender_position', type: 'varchar', length: 3 })
  defenderPosition: string;

  @Column({ name: 'attacker_condition', type: 'varchar', length: 20 })
  attackerCondition: string;

  @Column({ name: 'defender_condition', type: 'varchar', length: 20 })
  defenderCondition: string;

  @Column({ name: 'attack_attribute', type: 'varchar', length: 10 })
  attackAttribute: string;

  @Column({ name: 'defense_attribute', type: 'varchar', length: 10 })
  defenseAttribute: string;

  @Column({ name: 'attack_value', type: 'integer' })
  attackValue: number;

  @Column({ name: 'defense_value', type: 'integer' })
  defenseValue: number;

  @Column({ type: 'boolean' })
  goal: boolean;
}
