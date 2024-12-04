import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatbotAddIsModified1733318966806
  implements MigrationInterface
{
  name = 'AlterChatbotAddIsModified1733318966806';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chatbot" ADD "isModified" boolean`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chatbot" DROP COLUMN "isModified"`);
  }
}
