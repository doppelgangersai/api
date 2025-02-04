import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatbotAddStatsLimits1738683633578
  implements MigrationInterface
{
  name = 'AlterChatbotAddStatsLimits1738683633578';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "comment_per_day" integer DEFAULT '10'`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "post_session_count" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "agent_session_reset" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "comment_session_count" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ALTER COLUMN "post_per_day" SET DEFAULT '10'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" ALTER COLUMN "post_per_day" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "comment_session_count"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "agent_session_reset"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "post_session_count"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "comment_per_day"`,
    );
  }
}
