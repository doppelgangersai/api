import {MigrationInterface, QueryRunner} from "typeorm";

export class MissionCreate1739898983966 implements MigrationInterface {
    name = 'MissionCreate1739898983966'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."mission_validation_type_enum" RENAME TO "mission_validation_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."mission_validations_validationtype_enum" AS ENUM('join', 'follow', 'tag')`);
        await queryRunner.query(`ALTER TABLE "mission_validations" ALTER COLUMN "validationType" TYPE "public"."mission_validations_validationtype_enum" USING "validationType"::"text"::"public"."mission_validations_validationtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."mission_validation_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "missions" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "missions" ADD "description" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "missions" DROP COLUMN "platform"`);
        await queryRunner.query(`DROP TYPE "public"."missions_platform_enum"`);
        await queryRunner.query(`ALTER TABLE "missions" ADD "platform" character varying`);
        await queryRunner.query(`ALTER TYPE "public"."mission_status_enum" RENAME TO "mission_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_missions_status_enum" AS ENUM('todo', 'review', 'done')`);
        await queryRunner.query(`ALTER TABLE "user_missions" ALTER COLUMN "status" TYPE "public"."user_missions_status_enum" USING "status"::"text"::"public"."user_missions_status_enum"`);
        await queryRunner.query(`ALTER TABLE "user_missions" ALTER COLUMN "status" SET DEFAULT 'todo'`);
        await queryRunner.query(`DROP TYPE "public"."mission_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user_missions" ALTER COLUMN "status" SET DEFAULT 'todo'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_missions" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`CREATE TYPE "public"."mission_status_enum_old" AS ENUM('todo', 'review', 'done')`);
        await queryRunner.query(`ALTER TABLE "user_missions" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user_missions" ALTER COLUMN "status" TYPE "public"."mission_status_enum_old" USING "status"::"text"::"public"."mission_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."user_missions_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."mission_status_enum_old" RENAME TO "mission_status_enum"`);
        await queryRunner.query(`ALTER TABLE "missions" DROP COLUMN "platform"`);
        await queryRunner.query(`CREATE TYPE "public"."missions_platform_enum" AS ENUM('android', 'ios', 'web')`);
        await queryRunner.query(`ALTER TABLE "missions" ADD "platform" "public"."missions_platform_enum"`);
        await queryRunner.query(`ALTER TABLE "missions" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "missions" ADD "description" text NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."mission_validation_type_enum_old" AS ENUM('follow', 'join', 'tag')`);
        await queryRunner.query(`ALTER TABLE "mission_validations" ALTER COLUMN "validationType" TYPE "public"."mission_validation_type_enum_old" USING "validationType"::"text"::"public"."mission_validation_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."mission_validations_validationtype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."mission_validation_type_enum_old" RENAME TO "mission_validation_type_enum"`);
    }

}
