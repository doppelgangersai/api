import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterUserAddSoftDelete1738656780390 implements MigrationInterface {
    name = 'AlterUserAddSoftDelete1738656780390'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
    }

}
