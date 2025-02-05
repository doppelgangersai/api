import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserAddFcmToken1737762396610 implements MigrationInterface {
  name = 'AlterUserAddFcmToken1737762396610';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" ADD "fcmToken" character varying',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "users" DROP COLUMN "fcmToken"');
  }
}