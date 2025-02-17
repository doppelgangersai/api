import { MissionAction, MissionStatus, MissionValidationType } from 'modules/api/mission/types/mission.enums';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMissionEntities1641234567890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'mission_validations',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                },
                {
                    name: 'missionId',
                    type: 'int',
                },
                {
                    name: 'userId',
                    type: 'int',
                },
                {
                    name: 'validationType',
                    type: 'enum',
                    enumName: 'mission_validation_type_enum',
                    enum: [
                        MissionValidationType.FOLLOW,
                        MissionValidationType.JOIN,
                        MissionValidationType.TAG
                    ]
                },
                {
                    name: 'validationParams',
                    isNullable: true,
                    type: 'jsonb',
                },
            ],
        }));

        await queryRunner.createTable(new Table({
            name: 'missions',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                },
                {
                    name: 'title',
                    type: 'varchar',
                },
                {
                    name: 'description',
                    type: 'text',
                },
                {
                    name: 'action',
                    type: 'enum',
                    enumName: 'missions_action_enum',
                    enum: [
                        MissionAction.REFER,
                        MissionAction.FOLLOW,
                        MissionAction.TAG,
                        MissionAction.JOIN,
                        MissionAction.CONNECT,
                        MissionAction.MERGE,
                        MissionAction.CREATE_ACCOUNT
                    ],
                    },
                {
                    name: 'points',
                    type: 'int',
                },
                {
                    name: 'link',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'iosLink',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'androidLink',
                    type: 'varchar',
                    isNullable: true,
                },
                {
                    name: 'isRepeatable',
                    type: 'boolean',
                },
                {
                    name: 'isActive',
                    type: 'boolean',
                },
                {
                    name: 'platform',
                    type: 'enum',
                    enum: ['android', 'ios', 'web'],
                    isNullable: true,
                },
            ],
        }));

        await queryRunner.createTable(new Table({
            name: 'user_missions',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                },
                {
                    name: 'missionId',
                    type: 'int',
                },
                {
                    name: 'userId',
                    type: 'int',
                },
                {
                    name: 'status',
                    type: 'enum',
                    enumName: 'mission_status_enum',
                    enum: [MissionStatus.TODO, MissionStatus.REVIEW, MissionStatus.DONE],
                    isNullable: true,
                },
                {
                    name: 'completedAt',
                    type: 'timestamp',
                    isNullable: true,
                },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('user_missions');
        await queryRunner.dropTable('missions');
        await queryRunner.dropTable('mission_validations');
    }
}