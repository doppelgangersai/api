import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiProperty,
  ApiBearerAuth,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { User, UserService } from '../user';
import { InjectRepository } from '@nestjs/typeorm';
import {
  MissionStatus,
  UserMissionEntity,
} from './entites/user-mission.entity';
import { Repository } from 'typeorm';

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

  @ApiResponseProperty({
    example: MissionStatus.STARTED,
  })
  status?: MissionStatus;
  done?: boolean;

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
export class StartMissionDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the mission',
  })
  id: number;
}

@Controller('api/missions')
@ApiTags('missions')
export class MissionController {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(UserMissionEntity)
    private readonly userMissionRepository: Repository<UserMissionEntity>,
  ) {}
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Retrieve all missions and total points' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved missions and points.',
    type: MissionResponse,
  })
  @Get()
  async getMissions(@CurrentUser() user: User): Promise<MissionResponse> {
    const referralsCount = await this.userService.countReferrals(user.id);
    return {
      missions: [
        {
          id: 1,
          title: 'Refer a friend',
          description: 'Some description',
          action: 'refer',
          status: referralsCount > 0 && MissionStatus.COMPLETED,
          done: referralsCount > 0,
          points: 20,
        },
        {
          id: 2,
          title: 'Connect Data in Vault',
          description: 'Some description',
          action: 'connect',
          status:
            (!!user.instagramFile || !!user.telegramAuthSession) &&
            MissionStatus.COMPLETED,
          done: !!user.instagramFile || !!user.telegramAuthSession,
          points: 10,
        },
      ],
      points: user.points,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Start mission',
  })
  @Post('start')
  async startMission(
    @Body() mission: StartMissionDto,
    @CurrentUser() user: User,
  ) {
    const userMission = this.userMissionRepository.create({
      missionId: mission.id,
      userId: user.id,
      status: MissionStatus.STARTED,
    });
    await this.userMissionRepository.save(userMission);

    return {
      mission: {
        ...mission,
        userId: user.id,
        status: userMission.status,
      },
    };
  }
}
