import { MissionStatus } from './mission.enums';

/**
 * Interface representing a user's mission.
 */
export interface IUserMission {
    /**
     * Unique identifier for the user mission.
     * @type {number}
     */
    id: number;

    /**
     * Unique identifier for the user.
     * @type {number}
     */
    userId: number;

    /**
     * Unique identifier for the mission.
     * @type {number}
     */
    missionId: number;

    /**
     * Status of the mission.
     * @type {MissionStatus}
     */
    status: MissionStatus;

    /**
     * Date when the mission was completed.
     * @type {Date}
     * @optional
     */
    completedAt?: Date;
}