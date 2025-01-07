import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePointsTable1730913223621 implements MigrationInterface {
  name = 'CreatePointsTable1730913223621';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "points_transaction" ("id" SERIAL NOT NULL, "fromUserId" integer, "toUserId" integer, "amount" integer NOT NULL, "type" character varying NOT NULL, "message" character varying, CONSTRAINT "PK_d1704311d546dcd8c50ba3d2e3b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "points_transaction"`);
  }
}
