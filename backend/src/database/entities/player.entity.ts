import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Club } from './club.entity';

@Entity('players')
export class Player {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 3 })
  position: string;

  @Column({ type: 'integer' })
  agility: number;

  @Column({ type: 'integer' })
  age: number;

  @Column({ name: 'base_value', type: 'decimal', precision: 6, scale: 2 })
  baseValue: string;

  @Column({ type: 'varchar', length: 20, default: 'APTO' })
  condition: string;

  @Column({ name: 'club_id', type: 'integer', nullable: true })
  clubId: number | null;

  @ManyToOne(() => Club, { nullable: true })
  @JoinColumn({ name: 'club_id' })
  club: Club | null;

  @Column({ type: 'integer' })
  pace: number;

  @Column({ type: 'integer' })
  shooting: number;

  @Column({ type: 'integer' })
  passing: number;

  @Column({ type: 'integer' })
  dribbling: number;

  @Column({ type: 'integer' })
  defending: number;

  @Column({ type: 'integer' })
  physical: number;

  @Column({ type: 'integer' })
  potential: number;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
