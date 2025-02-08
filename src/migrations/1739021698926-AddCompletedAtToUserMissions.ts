import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddCompletedAtToUserMissions1739021698926 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          'ALTER TABLE "user_mission_entity" ADD "completedAt" TIMESTAMP',
        );
      }

      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
          'ALTER TABLE "user_mission_entity" DROP COLUMN "completedAt"',
        );
      }

}