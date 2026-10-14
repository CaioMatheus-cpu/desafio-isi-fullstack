import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Club } from './club.entity';
import { Player } from './player.entity';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'player_id', type: 'integer' })
  playerId: number;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column({ name: 'club_id', type: 'integer' })
  clubId: number;

  @ManyToOne(() => Club)
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @Column({ name: 'purchase_value', type: 'decimal', precision: 6, scale: 2 })
  purchaseValue: string;

  @Column({ name: 'loyalty_until', type: 'timestamptz' })
  loyaltyUntil: Date;

  @Column({ type: 'varchar', length: 12 })
  status: string;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt: Date | null;
}
