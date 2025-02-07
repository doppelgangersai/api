import { Module } from '@nestjs/common';
import { TwitterAccountController } from './twitter-accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitterAccount } from './twitter-account.entity';
import { TwitterAccountService } from './twitter-account.service';
import { TwitterAuthService } from './twitter-auth.service';
import { ConfigModule } from '../../config';
import { TwitterAccountEmitter } from './twitter-account.emitter';

@Module({
  imports: [TypeOrmModule.forFeature([TwitterAccount]), ConfigModule],
  controllers: [TwitterAccountController],
  providers: [TwitterAccountService, TwitterAuthService, TwitterAccountEmitter],
  exports: [TwitterAccountService],
})
export class TwitterModule {}
