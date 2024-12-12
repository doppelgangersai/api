import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserAddTwitterRefreshToken1734011797516
  implements MigrationInterface
{
  name = 'AlterUserAddTwitterRefreshToken1734011797516';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "twitterRefreshToken" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "twitterRefreshToken"`,
    );
  }
}
