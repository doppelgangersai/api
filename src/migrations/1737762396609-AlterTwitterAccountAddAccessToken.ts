import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTwitterAccountAddAccessToken1737762396609
  implements MigrationInterface
{
  name = 'AlterTwitterAccountAddAccessToken1737762396609';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "twitter_account" ADD "access_token" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitter_account" ADD "access_token_expiry" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitter_account" ALTER COLUMN "screen_name" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitter_account" ALTER COLUMN "twitter_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitter_account" ALTER COLUMN "refresh_token" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "twitter_account" ALTER COLUMN "refresh_token" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitter_account" ALTER COLUMN "twitter_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitter_account" ALTER COLUMN "screen_name" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitter_account" DROP COLUMN "access_token_expiry"`,
    );
    await queryRunner.query(
      `ALTER TABLE "twitter_account" DROP COLUMN "access_token"`,
    );
  }
}
