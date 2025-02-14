import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatbotAddLastInteractedTweetsIds1739546190223
  implements MigrationInterface
{
  name = 'AlterChatbotAddLastInteractedTweetsIds1739546190223';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "post_last_interacted_tweet_id" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "comment_last_interacted_tweet_id" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "comment_last_interacted_tweet_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "post_last_interacted_tweet_id"`,
    );
  }
}
