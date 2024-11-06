import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsTransaction } from './points-transaction.entity';
import { PointsService } from './points.service';
import { UserModule } from '../api/user';

@Module({
  imports: [TypeOrmModule.forFeature([PointsTransaction]), UserModule],
  providers: [PointsService],
  exports: [PointsService],
})
export class PointsModule {}
