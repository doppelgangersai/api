import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserMissionEntity } from './entites/user-mission.entity';
import { Repository } from 'typeorm';
import { TUserID } from '../user/user.types';

@Injectable()
export class MissionService {
  constructor(
    @InjectRepository(UserMissionEntity)
    private readonly userMissionRepository: Repository<UserMissionEntity>,
  ) {}

  // DB START

  create(mission: Partial<UserMissionEntity>) {
    return this.userMissionRepository.save(mission);
  }

  async getByUserId(userId: TUserID) {
    return this.userMissionRepository.find({ where: { userId } });
  }

  // / DB END
}
