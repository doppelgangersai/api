import { Module } from '@nestjs/common';
import { MissionController } from './mission.controller';
import { UserModule } from '../user';

@Module({
  imports: [UserModule],
  controllers: [MissionController],
  providers: [],
  exports: [],
})
export class MissionModule {}
