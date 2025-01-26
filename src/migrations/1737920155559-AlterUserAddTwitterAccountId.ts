import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserAddTwitterAccountId1737920155559
  implements MigrationInterface
{
  name = 'AlterUserAddTwitterAccountId1737920155559';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "twitterAccountId" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "twitterAccountId"`,
    );
  }
}
