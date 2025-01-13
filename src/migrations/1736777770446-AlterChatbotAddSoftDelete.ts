import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatbotAddSoftDelete1736777770446
  implements MigrationInterface
{
  name = 'AlterChatbotAddSoftDelete1736777770446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chatbot" ADD "deletedAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chatbot" DROP COLUMN "deletedAt"`);
  }
}
