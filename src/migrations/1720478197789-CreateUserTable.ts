import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1720478197789 implements MigrationInterface {
  name = 'CreateUserTable1720478197789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "fullName" character varying(255), "email" character varying(255) NOT NULL, "avatar" character varying(255), "password" character varying(255), "googleId" character varying, "googleAccessToken" character varying, "appleId" character varying, "appleAccessToken" character varying, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
