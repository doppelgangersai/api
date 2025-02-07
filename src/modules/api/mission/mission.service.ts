import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PointsService } from 'modules/points/points.service';
import { Repository } from 'typeorm';
import { User } from '../user';
import { MissionStatus, UserMissionEntity } from './entites/user-mission.entity';
import { ANDROID_BONUS_MISSION_ID, ANDROID_BONUS_POINTS } from './mission.consts';

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
}
