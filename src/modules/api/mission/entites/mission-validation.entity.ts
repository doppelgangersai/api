import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IMissionValidation } from '../types/mission-validation';
import { MissionValidationType } from '../types/mission.enums';

/**
 * Entity representing a mission validation.
 */
@Entity('mission_validations')
export class MissionValidationEntity implements IMissionValidation {
    /**
     * Unique identifier for the mission validation.
     */

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Identifier for the associated mission.
     */
    @Column()
    missionId: number;

    /**
     * Identifier for the associated user.
     */
    @Column()
    userId: number;

    /**
     * Type of validation.
     */
    @Column({ type: 'enum', enum: MissionValidationType })
    validationType: MissionValidationType;
    /**
     * Parameters for the validation.
     */
    @Column({ type: 'jsonb', nullable: true })
    validationParams: Record<string, string | number | boolean>;
}
