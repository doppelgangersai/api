import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserAddVault1721917783946 implements MigrationInterface {
  name = 'AlterUserAddVault1721917783946';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "instagramFile" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "linkedInFile" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "whatsAppFile" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "facebookFile" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "messengerFile" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "telegramFile" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "xUsername" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "tikTokUsername" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "points" integer DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "points"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tikTokUsername"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "xUsername"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "telegramFile"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "messengerFile"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "facebookFile"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "whatsAppFile"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "linkedInFile"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "instagramFile"`);
  }
}
