import { Body, Controller, Get, HttpCode, Post, UseGuards, NotFoundException, ConflictException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { User } from '../user';
import { MissionService } from './mission.service';
import { StartMissionDto } from './dto';

@Controller('api/missions')
@ApiTags('missions')
export class MissionController {
  constructor(
    private readonly missionService: MissionService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Start mission',
    description: 'Starts a new mission for the user',
  })
  @ApiResponse({
    status: 201,
    description: 'Mission successfully started',
  })
  @ApiResponse({
    status: 404,
    description: 'Mission not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Mission already in progress or completed',
  })
  @Post('start')
  async startMission(
    @Body() mission: StartMissionDto,
    @CurrentUser() user: User,
  ) {
    try {
      const startedMission = await this.missionService.startMission(user, mission.id);
      return {
        mission: {
          ...mission,
          userId: user.id,
          status: startedMission.status,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Complete mission',
    description: 'Completes a mission and awards points to the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Mission successfully completed',
  })
  @ApiResponse({
    status: 404,
    description: 'Mission not found or not started',
  })
  @ApiResponse({
    status: 409,
    description: 'Mission already completed',
  })
  @HttpCode(200)
  @Post('complete')
  async completeMission(
    @Body() mission: StartMissionDto,
    @CurrentUser() user: User,
  ) {
    try {
      const completedMission = await this.missionService.completeMission(user, mission.id);
      return {
        mission: completedMission,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}