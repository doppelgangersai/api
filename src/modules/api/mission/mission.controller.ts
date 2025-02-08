import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiResponseProperty,
  ApiTags,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { User, UserService } from '../user';
import {
  MissionStatus,
  UserMissionEntity,
} from './entites/user-mission.entity';
import { MISSIONS_LIST } from './mission.consts';
import { MissionService } from './mission.service';

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
    example: MissionStatus.TODO,
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
    private readonly missionService: MissionService,
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

    const userMissions = await this.userMissionRepository.find({
      where: {
        userId: user.id,
      },
    });

    // TODO: trigger 'connect' and 'refer' actions

    const mappedMissions = MISSIONS_LIST.map((m) => ({
      ...m,
      status:
        m.action === 'connect'
          ? (!!user.instagramFile ||
              !!user.telegramAuthSession ||
              !!user.twitterAccountId) &&
            MissionStatus.DONE
          : m.action === 'refer'
          ? referralsCount > 0 && MissionStatus.DONE
          : userMissions.find((um) => um.missionId === m.id)?.status,
    }));

    return {
      missions: mappedMissions,
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Reward user for Android app installation'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully rewarded user for Android app installation'
  })
  @HttpCode(200)
  @Post('android-reward')
  async handleAndroidReward(@CurrentUser() user: User) {
    await this.missionService.androidReward(user);
    return {
      success: true
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Complete mission',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully completed the mission and rewarded points.',
  })
  @HttpCode(200)
  @Post('complete')
  async completeMission(
    @Body() mission: StartMissionDto,
    @CurrentUser() user: User,
  ) {
    const completedMission = await this.missionService.completeMission(user, mission.id);
    return {
      mission: completedMission,
    };
  }
}
