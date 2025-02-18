import { MissionAction } from './mission.enums';

/**
 * Interface representing a mission in the system
 * @interface IMission
 */
export interface IMission {
    /**
     * Unique identifier for the mission
     * @type {number}
     */
    id: number;

    /**
     * Title of the mission displayed to users
     * @type {string}
     */
    title: string;

    /**
     * Detailed description of what the user needs to do to complete the mission
     * @type {string}
     */
    description: string;

    /**
     * Type of action required to complete the mission (e.g., REFER, FOLLOW, TAG)
     * @type {MissionAction}
     */
    action: MissionAction;

    /**
     * Number of points awarded to the user upon mission completion
     * @type {number}
     */
    points: number;

    /**
     * Web URL for completing the mission
     * @type {string}
     * @optional
     */
    link?: string;

    /**
     * Deep link URL for iOS devices to complete the mission
     * @type {string}
     * @optional
     */
    iosLink?: string;

    /**
     * Deep link URL for Android devices to complete the mission
     * @type {string}
     * @optional
     */
    androidLink?: string;

    /**
     * Indicates if the mission can be completed multiple times
     * @type {boolean}
     */
    isRepeatable: boolean;

    /**
     * Indicates if the mission is currently available to users
     * @type {boolean}
     */
    isActive: boolean;

    /**
     * Specifies which platform the mission is available on
     * @type {'android' | 'ios' | 'web'}
     * @optional
     */
    platform?: 'android' | 'ios' | 'web';
}