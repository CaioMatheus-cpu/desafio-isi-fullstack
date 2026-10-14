import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Club } from './club.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'home_club_id', type: 'integer' })
  homeClubId: number;

  @ManyToOne(() => Club)
  @JoinColumn({ name: 'home_club_id' })
  homeClub: Club;

  @Column({ name: 'away_club_id', type: 'integer' })
  awayClubId: number;

  @ManyToOne(() => Club)
  @JoinColumn({ name: 'away_club_id' })
  awayClub: Club;

  @Column({ name: 'home_goals', type: 'integer' })
  homeGoals: number;

  @Column({ name: 'away_goals', type: 'integer' })
  awayGoals: number;

  @Column({ name: 'home_formation', type: 'varchar', length: 5 })
  homeFormation: string;

  @Column({ name: 'away_formation', type: 'varchar', length: 5 })
  awayFormation: string;

  @Column({ name: 'played_at', type: 'timestamptz' })
  playedAt: Date;
}
