import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Clube } from './clube.entity';
import { Jogador } from './jogador.entity';
import { Partida } from './partida.entity';

@Entity('duelos_partida')
export class DueloPartida {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'partida_id', type: 'integer' })
  partidaId: number;

  @ManyToOne(() => Partida)
  @JoinColumn({ name: 'partida_id' })
  partida: Partida;

  @Column({ type: 'integer' })
  ordem: number;

  @Column({ name: 'clube_atacante_id', type: 'integer' })
  clubeAtacanteId: number;

  @ManyToOne(() => Clube)
  @JoinColumn({ name: 'clube_atacante_id' })
  clubeAtacante: Clube;

  @Column({ name: 'atacante_id', type: 'integer' })
  atacanteId: number;

  @ManyToOne(() => Jogador)
  @JoinColumn({ name: 'atacante_id' })
  atacante: Jogador;

  @Column({ name: 'defensor_id', type: 'integer' })
  defensorId: number;

  @ManyToOne(() => Jogador)
  @JoinColumn({ name: 'defensor_id' })
  defensor: Jogador;

  @Column({ name: 'nome_atacante', type: 'varchar', length: 100 })
  nomeAtacante: string;

  @Column({ name: 'nome_defensor', type: 'varchar', length: 100 })
  nomeDefensor: string;

  @Column({ name: 'posicao_atacante', type: 'varchar', length: 3 })
  posicaoAtacante: string;

  @Column({ name: 'posicao_defensor', type: 'varchar', length: 3 })
  posicaoDefensor: string;

  @Column({ name: 'condicao_atacante', type: 'varchar', length: 20 })
  condicaoAtacante: string;

  @Column({ name: 'condicao_defensor', type: 'varchar', length: 20 })
  condicaoDefensor: string;

  @Column({ name: 'atributo_ataque', type: 'varchar', length: 10 })
  atributoAtaque: string;

  @Column({ name: 'atributo_defesa', type: 'varchar', length: 10 })
  atributoDefesa: string;

  @Column({ name: 'valor_ataque', type: 'integer' })
  valorAtaque: number;

  @Column({ name: 'valor_defesa', type: 'integer' })
  valorDefesa: number;

  @Column({ type: 'boolean' })
  gol: boolean;
}
