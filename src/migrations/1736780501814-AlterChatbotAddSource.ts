import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatbotAddSource1736780501814 implements MigrationInterface {
  name = 'AlterChatbotAddSource1736780501814';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."chatbot_source_enum" AS ENUM('twitter', 'instagram', 'telegram', 'merged', 'db', 'unknown')`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "source" "public"."chatbot_source_enum" NOT NULL DEFAULT 'unknown'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chatbot" DROP COLUMN "source"`);
    await queryRunner.query(`DROP TYPE "public"."chatbot_source_enum"`);
  }
}
