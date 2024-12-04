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

/* Refer a Friend 1000 points
Invite a friend and earn points when they create their Doppelganger.

Follow Us on X 300 points
Stay in the loop! Follow us on X and get the latest updates.

Tag Us in a Post on X 500 points
Post or reshare with our tag on X and score some rewards!

Follow Us on TikTok 300 points
Join us on TikTok for exclusive content and more fun missions.

Tag Us in a TikTok Video 800 points
Share a video tagging us on TikTok to earn big rewards!

Follow Us on Instagram 300 points
Follow us on Instagram and stay inspired with daily updates.

Tag Us in an IG Post 500 points
Share or reshare a post tagging us on Instagram to earn points.

Join Our Discord 600 points
Be part of our community! Join Discord and chat with fans.

Join Our Telegram 600 points
Join our Telegram for news and insights. Points await!

Connect Data in Vault 3000 points
Link a data source in your vault to enhance your twin’s growth.

Merge Your Doppelganger  1000 points
Try merging Doppelgangers to create unique traits and earn rewards.

Subscribe on YouTube 300 points
Follow us on YouTube for exclusive videos and updates.

Create Your Doppelganger 5000 points
Start your journey! Build your AI twin and start earning points.

Chat with a Doppelganger 500 points
Initiate a chat with a Doppelganger and earn rewards for exploring.

 */

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

    const missions = [
      {
        id: 1,
        title: 'Refer a friend',
        description:
          'Invite a friend and earn points when they create their Doppelganger.',
        action: 'refer',
        status: referralsCount > 0 && MissionStatus.DONE,
        done: referralsCount > 0,
        points: 1000,
      },
      {
        id: 2,
        title: 'Follow Us on X',
        description:
          'Stay in the loop! Follow us on X and get the latest updates.',
        action: 'follow',
        status: MissionStatus.TODO,
        done: false,
        points: 300,
      },
      {
        id: 3,
        title: 'Tag Us in a Post on X',
        description:
          'Post or reshare with our tag on X and score some rewards!',
        action: 'tag',
        status: MissionStatus.TODO,
        done: false,
        points: 500,
      },
      {
        id: 4,
        title: 'Follow Us on TikTok',
        description:
          'Join us on TikTok for exclusive content and more fun missions.',
        action: 'follow',
        status: MissionStatus.TODO,
        done: false,
        points: 300,
      },
      {
        id: 5,
        title: 'Tag Us in a TikTok',
        description: 'Share a video tagging us on TikTok to earn big rewards!',
        action: 'tag',
        status: MissionStatus.TODO,
        done: false,
        points: 800,
      },
      {
        id: 6,
        title: 'Follow Us on Instagram',
        description:
          'Follow us on Instagram and stay inspired with daily updates.',
        action: 'follow',
        status: MissionStatus.TODO,
        done: false,
        points: 300,
      },
      {
        id: 7,
        title: 'Tag Us in an IG Post',
        description:
          'Share or reshare a post tagging us on Instagram to earn points.',
        action: 'tag',
        status: MissionStatus.TODO,
        done: false,
        points: 500,
      },
      {
        id: 8,
        title: 'Join Our Discord',
        description:
          'Be part of our community! Join Discord and chat with fans.',
        action: 'join',
        status: MissionStatus.TODO,
        done: false,
        points: 600,
      },
      {
        id: 9,
        title: 'Join Our Telegram',
        description: 'Join our Telegram for news and insights. Points await!',
        action: 'join',
        status: MissionStatus.TODO,
        done: false,
        points: 600,
      },
      {
        id: 10,
        title: 'Connect Data in Vault',
        description:
          'Link a data source in your vault to enhance your twin’s growth.',
        action: 'connect',
        status:
          (!!user.instagramFile || !!user.telegramAuthSession) &&
          MissionStatus.DONE,
        done: !!user.instagramFile || !!user.telegramAuthSession,
        points: 3000,
      },
    ];

    const userMissions = await this.userMissionRepository.find({
      where: {
        userId: user.id,
      },
    });

    const mappedMissions = missions.map((m) => ({
      ...m,
      status:
        userMissions.find((um) => um.missionId === m.id)?.status || m.status,
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
}
