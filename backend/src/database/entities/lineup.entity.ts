import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { Club } from './club.entity';
import { Player } from './player.entity';

@Entity('lineups')
@Unique('UQ_lineups_player_id', ['playerId'])
export class Lineup {
  @PrimaryColumn({ name: 'club_id', type: 'integer' })
  clubId: number;

  @ManyToOne(() => Club)
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @PrimaryColumn({ name: 'player_id', type: 'integer' })
  playerId: number;

  @OneToOne(() => Player)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
