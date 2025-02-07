import { Module } from '@nestjs/common';
import { MissionController } from './mission.controller';
import { UserModule } from '../user';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMissionEntity } from './entites/user-mission.entity';
import { PointsModule } from 'modules/points/points.module';
import { MissionService } from './mission.service';

@Module({
  imports: [
    UserModule,
    PointsModule,
    TypeOrmModule.forFeature([UserMissionEntity])
  ],
  controllers: [MissionController],
  providers: [MissionService],
  exports: [TypeOrmModule.forFeature([UserMissionEntity])],
})
export class MissionModule {}
