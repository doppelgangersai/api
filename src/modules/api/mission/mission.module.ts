import { Module } from '@nestjs/common';
import { MissionController } from './mission.controller';

@Module({
  imports: [],
  controllers: [MissionController],
  providers: [],
  exports: [],
})
export class MissionModule {}
