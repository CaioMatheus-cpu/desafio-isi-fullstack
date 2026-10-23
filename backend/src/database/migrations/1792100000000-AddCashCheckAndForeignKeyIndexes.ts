import { MigrationInterface, QueryRunner } from 'typeorm';

// O caixa de um clube nunca fica negativo: a compra é limitada a 50% do caixa e
// o crédito da venda nunca é negativo. A restrição no banco garante isso mesmo
// que algum código futuro erre a conta.
//
// Os índices ficam nas chaves estrangeiras que as consultas usam para achar o
// elenco de um clube, o histórico de transações e as partidas de um clube.
const INDEXES: [name: string, table: string, columns: string][] = [
  ['IDX_players_club_id', 'players', '"club_id"'],
  ['IDX_contracts_club_id', 'contracts', '"club_id"'],
  ['IDX_contracts_player_id', 'contracts', '"player_id"'],
  ['IDX_transactions_club_id', 'transactions', '"club_id", "created_at"'],
  ['IDX_transactions_player_id', 'transactions', '"player_id"'],
  ['IDX_matches_home_club_id', 'matches', '"home_club_id"'],
  ['IDX_matches_away_club_id', 'matches', '"away_club_id"'],
  ['IDX_match_duels_match_id', 'match_duels', '"match_id"'],
];

export class AddCashCheckAndForeignKeyIndexes1792100000000 implements MigrationInterface {
  name = 'AddCashCheckAndForeignKeyIndexes1792100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "clubs" ADD CONSTRAINT "CK_clubs_cash_not_negative" CHECK ("cash" >= 0)',
    );
    for (const [name, table, columns] of INDEXES) {
      await queryRunner.query(
        `CREATE INDEX "${name}" ON "${table}" (${columns})`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const [name] of INDEXES) {
      await queryRunner.query(`DROP INDEX "${name}"`);
    }
    await queryRunner.query(
      'ALTER TABLE "clubs" DROP CONSTRAINT "CK_clubs_cash_not_negative"',
    );
  }
}
