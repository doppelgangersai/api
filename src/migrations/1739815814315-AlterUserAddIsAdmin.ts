import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserAddIsAdmin1739815814315 implements MigrationInterface {
  name = 'AlterUserAddIsAdmin1739815814315';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "isAdmin" boolean DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isAdmin"`);
  }
}
