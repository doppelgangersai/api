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
import { StartMissionDto, UpdateMissionValidationDto } from './dto';
import { MissionService } from './mission.service';

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

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Update mission validation',
    description: 'Updates the validation parameters for a mission',
  })
  @ApiResponse({
    status: 200,
    description: 'Mission validation successfully updated',
  })
  @ApiResponse({
    status: 404,
    description: 'Mission validation not found',
  })
  @HttpCode(200)
  @Post('update-validation')
  async updateMissionValidation(
    @Body() updateMissionValidationDto: UpdateMissionValidationDto,
    @CurrentUser() user: User,
  ) {
    try {
      const updatedMissionValidation = await this.missionService.updateMissionValidation(
        user,
        updateMissionValidationDto.missionId,
        updateMissionValidationDto.validationParams,
      );

      return {
        missionValidation: updatedMissionValidation,
      };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all missions',
    description: 'Return all active missions that the user has not completed',
  })
  @Get()
  async getAllMissions(@CurrentUser() user: User) {
    const missions = await this.missionService.getAllMissions(user);
    return { missions };
  }
}