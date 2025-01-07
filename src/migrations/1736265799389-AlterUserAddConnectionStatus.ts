import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserAddConnectionStatus1736265799389
  implements MigrationInterface
{
  name = 'AlterUserAddConnectionStatus1736265799389';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_twitterconnectionstatus_enum" AS ENUM('unconnected', 'connected', 'processed', 'disconnected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "twitterConnectionStatus" "public"."users_twitterconnectionstatus_enum" NOT NULL DEFAULT 'unconnected'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_instagramconnectionstatus_enum" AS ENUM('unconnected', 'connected', 'processed', 'disconnected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "instagramConnectionStatus" "public"."users_instagramconnectionstatus_enum" NOT NULL DEFAULT 'unconnected'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_telegramconnectionstatus_enum" AS ENUM('unconnected', 'connected', 'processed', 'disconnected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "telegramConnectionStatus" "public"."users_telegramconnectionstatus_enum" NOT NULL DEFAULT 'unconnected'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "telegramConnectionStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."users_telegramconnectionstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "instagramConnectionStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."users_instagramconnectionstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "twitterConnectionStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."users_twitterconnectionstatus_enum"`,
    );
  }
}
