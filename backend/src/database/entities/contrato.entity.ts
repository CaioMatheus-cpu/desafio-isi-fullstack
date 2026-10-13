import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Clube } from './clube.entity';
import { Jogador } from './jogador.entity';

@Entity('contratos')
export class Contrato {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'jogador_id', type: 'integer' })
  jogadorId: number;

  @ManyToOne(() => Jogador)
  @JoinColumn({ name: 'jogador_id' })
  jogador: Jogador;

  @Column({ name: 'clube_id', type: 'integer' })
  clubeId: number;

  @ManyToOne(() => Clube)
  @JoinColumn({ name: 'clube_id' })
  clube: Clube;

  @Column({ name: 'valor_compra', type: 'decimal', precision: 6, scale: 2 })
  valorCompra: string;

  @Column({ name: 'fidelidade_ate', type: 'timestamptz' })
  fidelidadeAte: Date;

  @Column({ type: 'varchar', length: 12 })
  situacao: string;

  @Column({ name: 'iniciado_em', type: 'timestamptz' })
  iniciadoEm: Date;

  @Column({ name: 'encerrado_em', type: 'timestamptz', nullable: true })
  encerradoEm: Date | null;
}
