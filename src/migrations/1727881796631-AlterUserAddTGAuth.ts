import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterUserAddTGAuth1727881796631 implements MigrationInterface {
    name = 'AlterUserAddTGAuth1727881796631'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "telegramAuthSession" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "telegramAuthSession"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
    }

}
