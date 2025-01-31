import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterUserDropLegacyXUsername1738181429257 implements MigrationInterface {
    name = 'AlterUserDropLegacyXUsername1738181429257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "xUsername"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "xUsername" character varying`);
    }

}
