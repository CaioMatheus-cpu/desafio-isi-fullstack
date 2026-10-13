import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { Clube } from './clube.entity';
import { Jogador } from './jogador.entity';

@Entity('escalacoes')
@Unique('UQ_escalacoes_jogador_id', ['jogadorId'])
export class Escalacao {
  @PrimaryColumn({ name: 'clube_id', type: 'integer' })
  clubeId: number;

  @ManyToOne(() => Clube)
  @JoinColumn({ name: 'clube_id' })
  clube: Clube;

  @PrimaryColumn({ name: 'jogador_id', type: 'integer' })
  jogadorId: number;

  @OneToOne(() => Jogador)
  @JoinColumn({ name: 'jogador_id' })
  jogador: Jogador;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;
}
