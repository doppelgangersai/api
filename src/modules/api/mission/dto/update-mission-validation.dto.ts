import { ApiProperty } from '@nestjs/swagger';

export class UpdateMissionValidationDto {
    @ApiProperty({
        description: 'The ID of the mission validation to update',
        example: 2,
    })
    missionId: number;

    @ApiProperty({
        description: 'The JSON data for the validation',
        example: {
                link: 'https://x.com/Doppelgangerai',
                x_user_name: '@username',
        },
    })
    validationParams: Record<string, string | number | boolean>;
}