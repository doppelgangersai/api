import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserAddBackstory1724349325141 implements MigrationInterface {
  name = 'AlterUserAddBackstory1724349325141';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "backstory" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "backstory"`);
  }
}
