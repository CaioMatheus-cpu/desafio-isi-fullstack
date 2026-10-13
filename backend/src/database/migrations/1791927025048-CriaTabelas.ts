import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriaTabelas1791927025048 implements MigrationInterface {
  name = 'CriaTabelas1791927025048';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "clubes" ("id" SERIAL NOT NULL, "nome" character varying(60) NOT NULL, "sigla" character(3) NOT NULL, "caixa" numeric(10,2) NOT NULL DEFAULT '300.00', "formacao" character varying(5), "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_5851a0ab08b39cad276f0e9f0a0" UNIQUE ("sigla"), CONSTRAINT "PK_fb4807a2b8fe43f7bd7b80cf146" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "jogadores" ("id" SERIAL NOT NULL, "nome" character varying(100) NOT NULL, "posicao" character varying(3) NOT NULL, "agilidade" integer NOT NULL, "idade" integer NOT NULL, "valor_base" numeric(6,2) NOT NULL, "condicao" character varying(20) NOT NULL DEFAULT 'APTO', "clube_id" integer, "velocidade" integer NOT NULL, "finalizacao" integer NOT NULL, "passe" integer NOT NULL, "drible" integer NOT NULL, "defesa" integer NOT NULL, "fisico" integer NOT NULL, "potencial" integer NOT NULL, "excluido_em" TIMESTAMP WITH TIME ZONE, "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_47e3895364f0c1590ec6f47e75f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "contratos" ("id" SERIAL NOT NULL, "jogador_id" integer NOT NULL, "clube_id" integer NOT NULL, "valor_compra" numeric(6,2) NOT NULL, "fidelidade_ate" TIMESTAMP WITH TIME ZONE NOT NULL, "situacao" character varying(12) NOT NULL, "iniciado_em" TIMESTAMP WITH TIME ZONE NOT NULL, "encerrado_em" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_cfae35069d6f59da899c17ed397" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "partidas" ("id" SERIAL NOT NULL, "mandante_id" integer NOT NULL, "visitante_id" integer NOT NULL, "gols_mandante" integer NOT NULL, "gols_visitante" integer NOT NULL, "formacao_mandante" character varying(5) NOT NULL, "formacao_visitante" character varying(5) NOT NULL, "jogada_em" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_6e9cc7455a900d190278156517c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "duelos_partida" ("id" SERIAL NOT NULL, "partida_id" integer NOT NULL, "ordem" integer NOT NULL, "clube_atacante_id" integer NOT NULL, "atacante_id" integer NOT NULL, "defensor_id" integer NOT NULL, "nome_atacante" character varying(100) NOT NULL, "nome_defensor" character varying(100) NOT NULL, "posicao_atacante" character varying(3) NOT NULL, "posicao_defensor" character varying(3) NOT NULL, "condicao_atacante" character varying(20) NOT NULL, "condicao_defensor" character varying(20) NOT NULL, "atributo_ataque" character varying(10) NOT NULL, "atributo_defesa" character varying(10) NOT NULL, "valor_ataque" integer NOT NULL, "valor_defesa" integer NOT NULL, "gol" boolean NOT NULL, CONSTRAINT "PK_8b2fe1a2a910571c58d2dd2488f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "escalacoes" ("clube_id" integer NOT NULL, "jogador_id" integer NOT NULL, "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4b8f4876d1f9fc6db3fc753541f" PRIMARY KEY ("clube_id", "jogador_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transacoes" ("id" SERIAL NOT NULL, "clube_id" integer NOT NULL, "jogador_id" integer NOT NULL, "nome_jogador" character varying(100) NOT NULL, "tipo" character varying(6) NOT NULL, "valor" numeric(6,2) NOT NULL, "taxa" numeric(6,2) NOT NULL, "multa" numeric(6,2) NOT NULL, "lucro" numeric(7,2), "variacao_caixa" numeric(8,2) NOT NULL, "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_19e05c3d8e87df1545fcc6c8505" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "jogadores" ADD CONSTRAINT "FK_1ebd5329644f193232106f71ea1" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contratos" ADD CONSTRAINT "FK_419c72f7102a0a0d6eac419596c" FOREIGN KEY ("jogador_id") REFERENCES "jogadores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contratos" ADD CONSTRAINT "FK_7cbdb0ce9934d7dc207837f9413" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partidas" ADD CONSTRAINT "FK_b8c607b4aeedb55b13158c22761" FOREIGN KEY ("mandante_id") REFERENCES "clubes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "partidas" ADD CONSTRAINT "FK_8c45b8d7c9efc15b17e5204cd44" FOREIGN KEY ("visitante_id") REFERENCES "clubes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "duelos_partida" ADD CONSTRAINT "FK_e4c1787a54e32f722dc3ea7c297" FOREIGN KEY ("partida_id") REFERENCES "partidas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "duelos_partida" ADD CONSTRAINT "FK_d043d7417ae6f5422378cbe2ad1" FOREIGN KEY ("clube_atacante_id") REFERENCES "clubes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "duelos_partida" ADD CONSTRAINT "FK_a8339e54e8ed71d49cbc8f3defd" FOREIGN KEY ("atacante_id") REFERENCES "jogadores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "duelos_partida" ADD CONSTRAINT "FK_ea9455d9ac979afaed814181a75" FOREIGN KEY ("defensor_id") REFERENCES "jogadores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "escalacoes" ADD CONSTRAINT "FK_a0a7c9ac75cd2feb85a599c7477" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "escalacoes" ADD CONSTRAINT "FK_1ef0a4d06040f3240baec6fd32a" FOREIGN KEY ("jogador_id") REFERENCES "jogadores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transacoes" ADD CONSTRAINT "FK_64150d4b3c0f36708d73bce1993" FOREIGN KEY ("clube_id") REFERENCES "clubes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transacoes" ADD CONSTRAINT "FK_6ff9051da97a145f04c34c76e8d" FOREIGN KEY ("jogador_id") REFERENCES "jogadores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "escalacoes" ADD CONSTRAINT "UQ_escalacoes_jogador_id" UNIQUE ("jogador_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_clubes_nome_minusculo" ON "clubes" (LOWER("nome"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_contratos_jogador_ativo" ON "contratos" ("jogador_id") WHERE "situacao" = 'ATIVO'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_contratos_jogador_ativo"`);
    await queryRunner.query(`DROP INDEX "UQ_clubes_nome_minusculo"`);
    await queryRunner.query(
      `ALTER TABLE "escalacoes" DROP CONSTRAINT "UQ_escalacoes_jogador_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transacoes" DROP CONSTRAINT "FK_6ff9051da97a145f04c34c76e8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transacoes" DROP CONSTRAINT "FK_64150d4b3c0f36708d73bce1993"`,
    );
    await queryRunner.query(
      `ALTER TABLE "escalacoes" DROP CONSTRAINT "FK_1ef0a4d06040f3240baec6fd32a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "escalacoes" DROP CONSTRAINT "FK_a0a7c9ac75cd2feb85a599c7477"`,
    );
    await queryRunner.query(
      `ALTER TABLE "duelos_partida" DROP CONSTRAINT "FK_ea9455d9ac979afaed814181a75"`,
    );
    await queryRunner.query(
      `ALTER TABLE "duelos_partida" DROP CONSTRAINT "FK_a8339e54e8ed71d49cbc8f3defd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "duelos_partida" DROP CONSTRAINT "FK_d043d7417ae6f5422378cbe2ad1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "duelos_partida" DROP CONSTRAINT "FK_e4c1787a54e32f722dc3ea7c297"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partidas" DROP CONSTRAINT "FK_8c45b8d7c9efc15b17e5204cd44"`,
    );
    await queryRunner.query(
      `ALTER TABLE "partidas" DROP CONSTRAINT "FK_b8c607b4aeedb55b13158c22761"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contratos" DROP CONSTRAINT "FK_7cbdb0ce9934d7dc207837f9413"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contratos" DROP CONSTRAINT "FK_419c72f7102a0a0d6eac419596c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "jogadores" DROP CONSTRAINT "FK_1ebd5329644f193232106f71ea1"`,
    );
    await queryRunner.query(`DROP TABLE "transacoes"`);
    await queryRunner.query(`DROP TABLE "escalacoes"`);
    await queryRunner.query(`DROP TABLE "duelos_partida"`);
    await queryRunner.query(`DROP TABLE "partidas"`);
    await queryRunner.query(`DROP TABLE "contratos"`);
    await queryRunner.query(`DROP TABLE "jogadores"`);
    await queryRunner.query(`DROP TABLE "clubes"`);
  }
}
