import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatbotAddTwitterAccountId1737920244208
  implements MigrationInterface
{
  name = 'AlterChatbotAddTwitterAccountId1737920244208';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "twitterAccountId" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "twitterAccountId"`,
    );
  }
}
