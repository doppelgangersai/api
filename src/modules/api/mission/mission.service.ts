import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user';
import { UserMissionEntity } from './entites/user-mission.entity';
import { MissionAction, MissionStatus, MissionValidationType } from './types/mission.enums';
import { PointsService } from 'modules/points/points.service';
import { IMission } from './types/mission';
import { MissionEntity } from './entites/mission.entity';
import { MissionValidationEntity } from './entites/mission-validation.entity';

@Injectable()
export class MissionService {
  constructor(
    @InjectRepository(UserMissionEntity)
    private userMissionRepository: Repository<UserMissionEntity>,
    @InjectRepository(MissionEntity)
    private missionRepository: Repository<MissionEntity>,
    @InjectRepository(MissionValidationEntity)
    private missionValidationRepository: Repository<MissionValidationEntity>,
    private pointsService: PointsService,
  ) {}

  async startMission(user: User, missionId: number) {
    // Check if mission exists
    const missionDetails = await this.getMissionById(missionId);
    if (!missionDetails) {
      throw new NotFoundException('Mission not found');
    }

    // Check if user already has this mission
    const existingMission = await this.userMissionRepository.findOne({
      where: { userId: user.id, missionId }
    });

    if (existingMission) {
      if (existingMission.status === MissionStatus.DONE && !missionDetails.isRepeatable) {
        throw new ConflictException('Mission already completed');
      }

      if (existingMission.status === MissionStatus.REVIEW) {
        throw new ConflictException('Mission already in progress');
      }
    }

    const userMission = this.userMissionRepository.create({
      missionId,
      userId: user.id,
      status: MissionStatus.REVIEW
    });

    await this.userMissionRepository.save(userMission);
    const { FOLLOW, TAG, JOIN } = MissionAction;

    if ([FOLLOW, TAG as MissionAction, JOIN as MissionAction].includes(missionDetails.action)) {
      const missionValidation = this.missionValidationRepository.create({
        missionId,
        userId: user.id,
        validationType: missionDetails.action as unknown as MissionValidationType,
        validationParams: null,
      });

  await this.missionValidationRepository.save(missionValidation);
}

    return userMission;
  }

  async completeMission(user: User, missionId: number) {
    // Check if mission exists and is active
    const missionDetails = await this.getMissionById(missionId);
    if (!missionDetails) {
      throw new NotFoundException('Mission not found');
    }

    // Find user's mission
    const mission = await this.userMissionRepository.findOne({
      where: { userId: user.id, missionId },
    });

    if (!mission) {
      throw new NotFoundException('Mission not started');
    }

    if (mission.status === MissionStatus.DONE) {
      throw new ConflictException('Mission already completed');
    }

    // Update mission status
    mission.status = MissionStatus.DONE;
    mission.completedAt = new Date();

    // Save updated mission
    await this.userMissionRepository.save(mission);

    // Award points to user
    if (missionDetails) {
      await this.pointsService.reward(user.id, missionDetails.points);
    }

    return mission;
  }

  async updateMissionValidation(user: User, missionId: number, validationParams: Record<string, string | number | boolean>) {
    const missionValidation = await this.missionValidationRepository.findOne({
      where: { userId: user.id, missionId },
    });

    if (!missionValidation) {
      throw new NotFoundException('Mission validation not found');
    }

    missionValidation.validationParams = validationParams;
    await this.missionValidationRepository.save(missionValidation);

    return missionValidation;
  }


  async getMissionById(missionId: number): Promise<IMission | null> {
    return this.missionRepository.findOne({ where: { id: missionId } }) ?? null;
  }
}