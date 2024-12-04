import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterMissionsSetStatus1733319256070 implements MigrationInterface {
    name = 'AlterMissionsSetStatus1733319256070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."user_mission_entity_status_enum" RENAME TO "user_mission_entity_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_mission_entity_status_enum" AS ENUM('todo', 'started', 'review', 'done')`);
        await queryRunner.query(`ALTER TABLE "user_mission_entity" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_mission_entity" ALTER COLUMN "status" TYPE "public"."user_mission_entity_status_enum" USING "status"::"text"::"public"."user_mission_entity_status_enum"`);
        await queryRunner.query(`ALTER TABLE "user_mission_entity" ALTER COLUMN "status" SET DEFAULT 'todo'`);
        await queryRunner.query(`DROP TYPE "public"."user_mission_entity_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_mission_entity_status_enum_old" AS ENUM('started', 'completed', 'failed')`);
        await queryRunner.query(`ALTER TABLE "user_mission_entity" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_mission_entity" ALTER COLUMN "status" TYPE "public"."user_mission_entity_status_enum_old" USING "status"::"text"::"public"."user_mission_entity_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user_mission_entity" ALTER COLUMN "status" SET DEFAULT 'started'`);
        await queryRunner.query(`DROP TYPE "public"."user_mission_entity_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_mission_entity_status_enum_old" RENAME TO "user_mission_entity_status_enum"`);
    }

}
