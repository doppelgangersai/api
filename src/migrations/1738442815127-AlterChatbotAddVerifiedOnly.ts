import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterChatbotAddVerifiedOnly1738442815127 implements MigrationInterface {
    name = 'AlterChatbotAddVerifiedOnly1738442815127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chatbot" ADD "comment_verified_only" boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chatbot" DROP COLUMN "comment_verified_only"`);
    }

}
