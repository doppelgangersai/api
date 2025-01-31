import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTwitterAccountTable1737650474890
  implements MigrationInterface
{
  name = 'CreateTwitterAccountTable1737650474890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "twitter_account" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "screen_name" character varying NOT NULL, "twitter_id" integer NOT NULL, "refresh_token" character varying NOT NULL, CONSTRAINT "PK_c6df4b1fb4dad7c9e601216b5e3" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "twitter_account"`);
  }
}
