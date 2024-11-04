import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateChatBotTable1730472326061 implements MigrationInterface {
    name = 'CreateChatBotTable1730472326061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chatbot" ("id" SERIAL NOT NULL, "fullName" character varying NOT NULL, "description" character varying NOT NULL, "backstory" character varying NOT NULL, "avatar" character varying NOT NULL, "isPublic" boolean NOT NULL, "creatorId" integer NOT NULL, "ownerId" integer NOT NULL, CONSTRAINT "PK_1ee1961e62c5cec278314f1d68e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "chatbot"`);
    }

}
