import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatbotAddAgentSettings1738279374932
  implements MigrationInterface
{
  name = 'AlterChatbotAddAgentSettings1738279374932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chatbot" ADD "post_enabled" boolean`);
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "post_accounts" text array`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "post_keywords" text array`,
    );
    await queryRunner.query(`ALTER TABLE "chatbot" ADD "post_prompt" text`);
    await queryRunner.query(`ALTER TABLE "chatbot" ADD "post_per_day" integer`);
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "comment_enabled" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "comment_accounts" text array`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "comment_reply_when_tagged" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "comment_x_accounts_replies" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "comment_my_accounts_replies" boolean`,
    );
    await queryRunner.query(`ALTER TABLE "chatbot" ADD "comment_prompt" text`);
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "comment_min_followers" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "comment_older_then" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "post_last_check" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "comment_last_check" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "comment_last_check"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "post_last_check"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "comment_older_then"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "comment_min_followers"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "comment_prompt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "comment_my_accounts_replies"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "comment_x_accounts_replies"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "comment_reply_when_tagged"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "comment_accounts"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "comment_enabled"`,
    );
    await queryRunner.query(`ALTER TABLE "chatbot" DROP COLUMN "post_per_day"`);
    await queryRunner.query(`ALTER TABLE "chatbot" DROP COLUMN "post_prompt"`);
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "post_keywords"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "post_accounts"`,
    );
    await queryRunner.query(`ALTER TABLE "chatbot" DROP COLUMN "post_enabled"`);
  }
}
