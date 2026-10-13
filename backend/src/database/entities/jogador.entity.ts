import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Clube } from './clube.entity';

@Entity('jogadores')
export class Jogador {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'varchar', length: 3 })
  posicao: string;

  @Column({ type: 'integer' })
  agilidade: number;

  @Column({ type: 'integer' })
  idade: number;

  @Column({ name: 'valor_base', type: 'decimal', precision: 6, scale: 2 })
  valorBase: string;

  @Column({ type: 'varchar', length: 20, default: 'APTO' })
  condicao: string;

  @Column({ name: 'clube_id', type: 'integer', nullable: true })
  clubeId: number | null;

  @ManyToOne(() => Clube, { nullable: true })
  @JoinColumn({ name: 'clube_id' })
  clube: Clube | null;

  @Column({ type: 'integer' })
  velocidade: number;

  @Column({ type: 'integer' })
  finalizacao: number;

  @Column({ type: 'integer' })
  passe: number;

  @Column({ type: 'integer' })
  drible: number;

  @Column({ type: 'integer' })
  defesa: number;

  @Column({ type: 'integer' })
  fisico: number;

  @Column({ type: 'integer' })
  potencial: number;

  @Column({ name: 'excluido_em', type: 'timestamptz', nullable: true })
  excluidoEm: Date | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamptz' })
  atualizadoEm: Date;
}
