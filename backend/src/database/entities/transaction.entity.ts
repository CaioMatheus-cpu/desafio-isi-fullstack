import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Club } from './club.entity';
import { Player } from './player.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'club_id', type: 'integer' })
  clubId: number;

  @ManyToOne(() => Club)
  @JoinColumn({ name: 'club_id' })
  club: Club;

  @Column({ name: 'player_id', type: 'integer' })
  playerId: number;

  @ManyToOne(() => Player)
  @JoinColumn({ name: 'player_id' })
  player: Player;

  @Column({ name: 'player_name', type: 'varchar', length: 100 })
  playerName: string;

  @Column({ type: 'varchar', length: 6 })
  type: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  value: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  fee: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  penalty: string;

  @Column({ type: 'decimal', precision: 7, scale: 2, nullable: true })
  profit: string | null;

  @Column({ name: 'cash_change', type: 'decimal', precision: 8, scale: 2 })
  cashChange: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
