import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('clubes')
export class Clube {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 60 })
  nome: string;

  @Column({ type: 'char', length: 3, unique: true })
  sigla: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: '300.00' })
  caixa: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  formacao: string | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
