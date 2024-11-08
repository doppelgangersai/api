import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateUserMissionsTable1731093516795 implements MigrationInterface {
    name = 'CreateUserMissionsTable1731093516795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_mission_entity_status_enum" AS ENUM('started', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "user_mission_entity" ("id" SERIAL NOT NULL, "missionId" integer NOT NULL, "userId" integer NOT NULL, "status" "public"."user_mission_entity_status_enum" DEFAULT 'started', CONSTRAINT "PK_688540d0a422ca115a0421554fa" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_mission_entity"`);
        await queryRunner.query(`DROP TYPE "public"."user_mission_entity_status_enum"`);
    }

}
