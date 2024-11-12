import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserAddNear1731446119180 implements MigrationInterface {
  name = 'AlterUserAddNear1731446119180';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "nearAccountId" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "nearPublicKey" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ALTER COLUMN "avatar" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nearPublicKey"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nearAccountId"`);
  }
}
