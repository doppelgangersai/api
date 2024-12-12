import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterUserAddTwitterUserIdAndUsername1734012747154 implements MigrationInterface {
    name = 'AlterUserAddTwitterUserIdAndUsername1734012747154'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "twitterUserId" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "twitterUsername" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "twitterUsername"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "twitterUserId"`);
    }

}
