import { MigrationInterface, QueryRunner } from 'typeorm';

// A busca por nome ignora acentos (joao encontra João). O Postgres faz isso
// com a extensão unaccent, que vem junto da instalação padrão.
export class EnableUnaccent1792000000000 implements MigrationInterface {
  name = 'EnableUnaccent1792000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS unaccent');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP EXTENSION IF EXISTS unaccent');
  }
}
