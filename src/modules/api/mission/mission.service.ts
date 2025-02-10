import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PointsService } from 'modules/points/points.service';
import { Repository } from 'typeorm';
import { User } from '../user';
import { MissionStatus, UserMissionEntity } from './entites/user-mission.entity';
import { ANDROID_BONUS_MISSION_ID, ANDROID_BONUS_POINTS, MISSIONS_LIST } from './mission.consts';

@Injectable()
export class MissionService {
  constructor(
    @InjectRepository(UserMissionEntity)
    private userMissionRepository: Repository<UserMissionEntity>,
    private pointsService: PointsService,
  ) {}

  async androidReward(user: User) {
    const mission = this.userMissionRepository.create({
      missionId: ANDROID_BONUS_MISSION_ID,
      userId: user.id,
      status: MissionStatus.DONE,
    });

    await this.userMissionRepository.save(mission);
    await this.pointsService.reward(user.id, ANDROID_BONUS_POINTS);
  }

  async completeMission(user: User, missionId: number) {
    const mission = await this.userMissionRepository.findOne({
      where: { userId: user.id, missionId },
    });

    if (!mission) {
      throw new Error('Mission not found');
    }

    mission.status = MissionStatus.DONE;
    mission.completedAt = new Date();

    await this.userMissionRepository.save(mission);

    const missionDetails = this.getMissionDetails(missionId);
    if (missionDetails) {
      await this.pointsService.reward(user.id, missionDetails.points);
    }

    return mission;
  }

  private getMissionDetails(missionId: number) {
    return MISSIONS_LIST.find((m) => m.id === missionId);
  }
}
