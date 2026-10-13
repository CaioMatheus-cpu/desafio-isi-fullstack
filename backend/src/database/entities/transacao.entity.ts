import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Clube } from './clube.entity';
import { Jogador } from './jogador.entity';

@Entity('transacoes')
export class Transacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'clube_id', type: 'integer' })
  clubeId: number;

  @ManyToOne(() => Clube)
  @JoinColumn({ name: 'clube_id' })
  clube: Clube;

  @Column({ name: 'jogador_id', type: 'integer' })
  jogadorId: number;

  @ManyToOne(() => Jogador)
  @JoinColumn({ name: 'jogador_id' })
  jogador: Jogador;

  @Column({ name: 'nome_jogador', type: 'varchar', length: 100 })
  nomeJogador: string;

  @Column({ type: 'varchar', length: 6 })
  tipo: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  valor: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  taxa: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  multa: string;

  @Column({ type: 'decimal', precision: 7, scale: 2, nullable: true })
  lucro: string | null;

  @Column({ name: 'variacao_caixa', type: 'decimal', precision: 8, scale: 2 })
  variacaoCaixa: string;

  @Column({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
