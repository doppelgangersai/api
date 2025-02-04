import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatbotAddAgentEnabledExperimental1738663629586
  implements MigrationInterface
{
  name = 'AlterChatbotAddAgentEnabledExperimental1738663629586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "agent_experimental" boolean`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ADD "agent_enabled" boolean`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "agent_enabled"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" DROP COLUMN "agent_experimental"`,
    );
  }
}
