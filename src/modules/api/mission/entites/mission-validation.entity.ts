import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IMissionValidation } from '../types/mission-validation';

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
     * Type of validation.
     */
    @Column({ type: 'varchar' })
    validationType: string;

    /**
     * Parameters for the validation.
     */
    @Column({ type: 'jsonb' })
    validationParams: Record<string, string | number | boolean>;
}
