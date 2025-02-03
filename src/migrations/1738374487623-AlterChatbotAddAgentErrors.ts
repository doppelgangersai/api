import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatbotAddAgentErrors1738374487623
  implements MigrationInterface
{
  name = 'AlterChatbotAddAgentErrors1738374487623';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "last_agent_error" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "last_agent_error_message" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "last_agent_error_message"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "last_agent_error"`,
    );
  }
}
