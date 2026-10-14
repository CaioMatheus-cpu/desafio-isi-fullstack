import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('clubs')
export class Club {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 60 })
  name: string;

  @Column({ type: 'char', length: 3, unique: true })
  acronym: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: '300.00' })
  cash: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  formation: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
