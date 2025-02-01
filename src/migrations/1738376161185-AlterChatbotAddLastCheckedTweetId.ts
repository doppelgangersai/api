import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatbotAddLastCheckedTweetId1738376161185
  implements MigrationInterface
{
  name = 'AlterChatbotAddLastCheckedTweetId1738376161185';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "post_last_checked_tweet_id" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "post_last_checked_tweet_id"`,
    );
  }
}
