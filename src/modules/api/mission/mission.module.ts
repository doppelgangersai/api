import { Module } from '@nestjs/common';
import { MissionController } from './mission.controller';
import { UserModule } from '../user';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMissionEntity } from './entites/user-mission.entity';
import { PointsModule } from 'modules/points/points.module';
import { MissionService } from './mission.service';
import { MissionEntity } from './entites/mission.entity';
import { MissionValidationEntity } from './entites/mission-validation.entity';

@Module({
  imports: [
    UserModule,
    PointsModule,
    TypeOrmModule.forFeature([UserMissionEntity, MissionEntity, MissionValidationEntity])
  ],
  controllers: [MissionController],
  providers: [MissionService],
  exports: [TypeOrmModule.forFeature([UserMissionEntity])],
})
export class MissionModule {}
