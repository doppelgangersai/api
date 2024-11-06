import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

class Mission {
  @ApiProperty({ example: 1, description: 'Unique identifier for the mission' })
  id: number;

  @ApiProperty({
    example: 'Refer a friend',
    description: 'Title of the mission',
  })
  title: string;

  @ApiProperty({
    example: 'Some description',
    description: 'Detailed description of the mission',
  })
  description: string;

  @ApiProperty({
    example: 'refer',
    description: 'Action associated with the mission',
  })
  action: string;

  @ApiProperty({
    example: true,
    description: 'Completion status of the mission',
  })
  done: boolean;

  @ApiProperty({
    example: 20,
    description: 'Points awarded for completing the mission',
  })
  points: number;
}

export class MissionResponse {
  @ApiProperty({ type: [Mission], description: 'List of missions available' })
  missions: Mission[];

  @ApiProperty({
    example: 140,
    description: 'Total points accumulated from completed missions',
  })
  points: number;
}

@Controller('api/missions')
@ApiTags('api/missions')
export class MissionController {
  @ApiOperation({ summary: 'Retrieve all missions and total points' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved missions and points.',
    type: MissionResponse,
  })
  @Get()
  getMissions(): MissionResponse {
    return {
      missions: [
        {
          id: 1,
          title: 'Refer a friend',
          description: 'Some description',
          action: 'refer',
          done: true,
          points: 20,
        },
        {
          id: 2,
          title: 'Connect Data in Vault',
          description: 'Some description',
          action: 'connect',
          done: false,
          points: 10,
        },
      ],
      points: 140,
    };
  }
}
