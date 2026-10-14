import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables1791940184014 implements MigrationInterface {
  name = 'CreateTables1791940184014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "clubs" ("id" SERIAL NOT NULL, "name" character varying(60) NOT NULL, "acronym" character(3) NOT NULL, "cash" numeric(10,2) NOT NULL DEFAULT '300.00', "formation" character varying(5), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_c72d195e7886de9cbe1db72532a" UNIQUE ("acronym"), CONSTRAINT "PK_bb09bd0c8d5238aeaa8f86ee0d4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "players" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "position" character varying(3) NOT NULL, "agility" integer NOT NULL, "age" integer NOT NULL, "base_value" numeric(6,2) NOT NULL, "condition" character varying(20) NOT NULL DEFAULT 'APTO', "club_id" integer, "pace" integer NOT NULL, "shooting" integer NOT NULL, "passing" integer NOT NULL, "dribbling" integer NOT NULL, "defending" integer NOT NULL, "physical" integer NOT NULL, "potential" integer NOT NULL, "deleted_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "contracts" ("id" SERIAL NOT NULL, "player_id" integer NOT NULL, "club_id" integer NOT NULL, "purchase_value" numeric(6,2) NOT NULL, "loyalty_until" TIMESTAMP WITH TIME ZONE NOT NULL, "status" character varying(12) NOT NULL, "started_at" TIMESTAMP WITH TIME ZONE NOT NULL, "ended_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2c7b8f3a7b1acdd49497d83d0fb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "matches" ("id" SERIAL NOT NULL, "home_club_id" integer NOT NULL, "away_club_id" integer NOT NULL, "home_goals" integer NOT NULL, "away_goals" integer NOT NULL, "home_formation" character varying(5) NOT NULL, "away_formation" character varying(5) NOT NULL, "played_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_8a22c7b2e0828988d51256117f4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "match_duels" ("id" SERIAL NOT NULL, "match_id" integer NOT NULL, "duel_order" integer NOT NULL, "attacking_club_id" integer NOT NULL, "attacker_id" integer NOT NULL, "defender_id" integer NOT NULL, "attacker_name" character varying(100) NOT NULL, "defender_name" character varying(100) NOT NULL, "attacker_position" character varying(3) NOT NULL, "defender_position" character varying(3) NOT NULL, "attacker_condition" character varying(20) NOT NULL, "defender_condition" character varying(20) NOT NULL, "attack_attribute" character varying(10) NOT NULL, "defense_attribute" character varying(10) NOT NULL, "attack_value" integer NOT NULL, "defense_value" integer NOT NULL, "goal" boolean NOT NULL, CONSTRAINT "PK_3d3b0e1fc1c5b347727f38d628d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "lineups" ("club_id" integer NOT NULL, "player_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_lineups_player_id" UNIQUE ("player_id"), CONSTRAINT "PK_fb0df6b76036e2b3cf1cb39eb0a" PRIMARY KEY ("club_id", "player_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "club_id" integer NOT NULL, "player_id" integer NOT NULL, "player_name" character varying(100) NOT NULL, "type" character varying(6) NOT NULL, "value" numeric(6,2) NOT NULL, "fee" numeric(6,2) NOT NULL, "penalty" numeric(6,2) NOT NULL, "profit" numeric(7,2), "cash_change" numeric(8,2) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "players" ADD CONSTRAINT "FK_a5426cbe2c827e9ec511b3d00a5" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "FK_e4233d576b793b65c0128155060" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "FK_83410ce7734fa638598c0ab4b6a" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "matches" ADD CONSTRAINT "FK_f3c22d646760991ae1f4f2615d3" FOREIGN KEY ("home_club_id") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "matches" ADD CONSTRAINT "FK_5ec76a1a3d03ca3cb2567585736" FOREIGN KEY ("away_club_id") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_duels" ADD CONSTRAINT "FK_b62d4705531a8e3d2801652686c" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_duels" ADD CONSTRAINT "FK_25b7c4ca70ec680a0e38b37c287" FOREIGN KEY ("attacking_club_id") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_duels" ADD CONSTRAINT "FK_d13dbdb09391000c36463588ce0" FOREIGN KEY ("attacker_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_duels" ADD CONSTRAINT "FK_af74cf5da79ae96e7e1dc00a7fe" FOREIGN KEY ("defender_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lineups" ADD CONSTRAINT "FK_09b138d5d67a223348b9bcc1bde" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lineups" ADD CONSTRAINT "FK_5564ba1b3f8d7bb10073e0b146b" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_9e8b70ea86a38f710f05df92317" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_05767b4dc6ebb80a49f03a755fd" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_clubs_name_lower" ON "clubs" (LOWER("name"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_contracts_active_player" ON "contracts" ("player_id") WHERE "status" = 'ATIVO'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_contracts_active_player"`);
    await queryRunner.query(`DROP INDEX "UQ_clubs_name_lower"`);
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_05767b4dc6ebb80a49f03a755fd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_9e8b70ea86a38f710f05df92317"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lineups" DROP CONSTRAINT "FK_5564ba1b3f8d7bb10073e0b146b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lineups" DROP CONSTRAINT "FK_09b138d5d67a223348b9bcc1bde"`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_duels" DROP CONSTRAINT "FK_af74cf5da79ae96e7e1dc00a7fe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_duels" DROP CONSTRAINT "FK_d13dbdb09391000c36463588ce0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_duels" DROP CONSTRAINT "FK_25b7c4ca70ec680a0e38b37c287"`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_duels" DROP CONSTRAINT "FK_b62d4705531a8e3d2801652686c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "matches" DROP CONSTRAINT "FK_5ec76a1a3d03ca3cb2567585736"`,
    );
    await queryRunner.query(
      `ALTER TABLE "matches" DROP CONSTRAINT "FK_f3c22d646760991ae1f4f2615d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "FK_83410ce7734fa638598c0ab4b6a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "FK_e4233d576b793b65c0128155060"`,
    );
    await queryRunner.query(
      `ALTER TABLE "players" DROP CONSTRAINT "FK_a5426cbe2c827e9ec511b3d00a5"`,
    );
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "lineups"`);
    await queryRunner.query(`DROP TABLE "match_duels"`);
    await queryRunner.query(`DROP TABLE "matches"`);
    await queryRunner.query(`DROP TABLE "contracts"`);
    await queryRunner.query(`DROP TABLE "players"`);
    await queryRunner.query(`DROP TABLE "clubs"`);
  }
}
