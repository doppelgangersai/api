import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserAddReferredId1730915382046 implements MigrationInterface {
  name = 'AlterUserAddReferredId1730915382046';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "referrerId" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "referrerId"`);
  }
}
