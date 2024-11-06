import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiProperty,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { User } from '../user';

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
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Retrieve all missions and total points' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved missions and points.',
    type: MissionResponse,
  })
  @Get()
  getMissions(@CurrentUser() user: User): MissionResponse {
    return {
      missions: [
        {
          id: 1,
          title: 'Refer a friend',
          description: 'Some description',
          action: 'refer',
          done: false,
          points: 20,
        },
        {
          id: 2,
          title: 'Connect Data in Vault',
          description: 'Some description',
          action: 'connect',
          done: !!user.instagramFile || !!user.telegramAuthSession,
          points: 10,
        },
      ],
      points: user.points,
    };
  }
}
