import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatbotNullables1731234667601 implements MigrationInterface {
  name = 'AlterChatbotNullables1731234667601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" ALTER COLUMN "fullName" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ALTER COLUMN "description" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ALTER COLUMN "avatar" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chatbot" ALTER COLUMN "avatar" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "chatbot" ALTER COLUMN "fullName" SET NOT NULL`,
    );
  }
}
