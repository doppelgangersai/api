import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class StartMissionDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: 'The ID of the mission to start',
        example: 1,
    })
    id: number;
}