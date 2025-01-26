import { Module } from '@nestjs/common';
import { TwitterAccountController } from './twitter-accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitterAccount } from './twitter-account.entity';
import { TwitterAccountService } from './twitter-account.service';
import { TwitterAuthService } from './twitter-auth.service';
import { ConfigModule } from '../../config';

@Module({
  imports: [TypeOrmModule.forFeature([TwitterAccount]), ConfigModule],
  controllers: [TwitterAccountController],
  providers: [TwitterAccountService, TwitterAuthService],
  exports: [TwitterAccountService],
})
export class TwitterModule {}
