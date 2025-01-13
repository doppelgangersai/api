import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatbotAddTwitterFields1736793461654
  implements MigrationInterface
{
  name = 'AlterChatbotAddTwitterFields1736793461654';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "twitterRefreshToken" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "twitterUsername" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "twitterUserId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "twitterUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "twitterUsername"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "twitterRefreshToken"`,
    );
  }
}
