import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterChatbotAddTitle1732279728176 implements MigrationInterface {
    name = 'AlterChatbotAddTitle1732279728176'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chatbot" ADD "title" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chatbot" DROP COLUMN "title"`);
    }

}
