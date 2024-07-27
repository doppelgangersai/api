import { Module } from '@nestjs/common';
import { ConfigModule } from 'modules/config';
import { StorageService } from './storage.service';

@Module({
  imports: [ConfigModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
