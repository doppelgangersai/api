/**
 * Interface representing the validation details of a mission.
 */
export interface IMissionValidation {
    /**
     * Unique identifier for the mission validation.
     */
    id: number;

    /**
     * Identifier of the mission to which this validation belongs.
     */
    missionId: number;

    /**
     * Type of validation to be performed.
     */
    validationType: string;

    /**
     * Parameters required for the validation.
     */
    validationParams: Record<string, string | number | boolean>;
}
