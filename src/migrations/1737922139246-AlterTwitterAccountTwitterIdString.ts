import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterTwitterAccountTwitterIdString1737922139246 implements MigrationInterface {
    name = 'AlterTwitterAccountTwitterIdString1737922139246'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "twitter_account" DROP COLUMN "twitter_id"`);
        await queryRunner.query(`ALTER TABLE "twitter_account" ADD "twitter_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "twitter_account" DROP COLUMN "twitter_id"`);
        await queryRunner.query(`ALTER TABLE "twitter_account" ADD "twitter_id" integer`);
    }

}
