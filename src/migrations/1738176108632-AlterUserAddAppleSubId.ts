import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserAddAppleSubId1738176108632 implements MigrationInterface {
  name = 'AlterUserAddAppleSubId1738176108632';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "appleSubId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "appleSubId"`);
  }
}
