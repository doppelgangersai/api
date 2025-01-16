import { Module } from '@nestjs/common';
import { MissionController } from './mission.controller';
import { UserModule } from '../user';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMissionEntity } from './entites/user-mission.entity';
import { MissionService } from './mission.service';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([UserMissionEntity])],
  controllers: [MissionController],
  providers: [MissionService],
  exports: [],
})
export class MissionModule {}
