import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMissionEntities1739906998243 implements MigrationInterface {
  name = 'CreateMissionEntities1739906998243';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."missions_action_enum" AS ENUM('refer', 'follow', 'tag', 'join', 'connect', 'merge', 'create_account')`,
    );
    await queryRunner.query(
      `CREATE TABLE "missions" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "action" "public"."missions_action_enum" NOT NULL, "points" integer NOT NULL, "link" character varying, "iosLink" character varying, "androidLink" character varying, "isRepeatable" boolean NOT NULL, "isActive" boolean NOT NULL, "platform" character varying, CONSTRAINT "PK_787aebb1ac5923c9904043c6309" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_missions_status_enum" AS ENUM('todo', 'review', 'done')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_missions" ("id" SERIAL NOT NULL, "missionId" integer NOT NULL, "userId" integer NOT NULL, "status" "public"."user_missions_status_enum" DEFAULT 'todo', "completedAt" TIMESTAMP, CONSTRAINT "PK_252d92542f9926e799c0161ac46" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."mission_validations_validationtype_enum" AS ENUM('join', 'follow', 'tag')`,
    );
    await queryRunner.query(
      `CREATE TABLE "mission_validations" ("id" SERIAL NOT NULL, "missionId" integer NOT NULL, "userId" integer NOT NULL, "validationType" "public"."mission_validations_validationtype_enum" NOT NULL, "validationParams" jsonb, CONSTRAINT "PK_f42f5d5a80f6f3ada2ba02f7309" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "mission_validations"`);
    await queryRunner.query(
      `DROP TYPE "public"."mission_validations_validationtype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "user_missions"`);
    await queryRunner.query(`DROP TYPE "public"."user_missions_status_enum"`);
    await queryRunner.query(`DROP TABLE "missions"`);
    await queryRunner.query(`DROP TYPE "public"."missions_action_enum"`);
  }
}
