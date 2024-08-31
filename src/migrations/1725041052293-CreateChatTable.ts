import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateChatTable1725041052293 implements MigrationInterface {
    name = 'CreateChatTable1725041052293'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chat" ("id" SERIAL NOT NULL, "provider_name" character varying, "provider_internal_id" character varying, "with_user_id" integer, "from_user_id" integer NOT NULL, "name" character varying, "description" character varying, "image_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9d0b2ba74336710fd31154738a5" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "chat"`);
    }

}
