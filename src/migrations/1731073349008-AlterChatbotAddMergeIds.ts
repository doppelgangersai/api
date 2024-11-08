import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterChatbotAddMergeIds1731073349008 implements MigrationInterface {
    name = 'AlterChatbotAddMergeIds1731073349008'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chatbot" ADD "merge1Id" integer`);
        await queryRunner.query(`ALTER TABLE "chatbot" ADD "merge2Id" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD "chatbotId" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "chatbotId"`);
        await queryRunner.query(`ALTER TABLE "chatbot" DROP COLUMN "merge2Id"`);
        await queryRunner.query(`ALTER TABLE "chatbot" DROP COLUMN "merge1Id"`);
    }

}
