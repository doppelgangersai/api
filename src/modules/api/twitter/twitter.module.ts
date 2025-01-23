import { Module } from '@nestjs/common';
import { TwitterAccountController } from './twitter-accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwitterAccount } from './twitter-account.entity';
import { TwitterAccountService } from './twitter-account.service';

@Module({
  imports: [TypeOrmModule.forFeature([TwitterAccount])],
  controllers: [TwitterAccountController],
  providers: [TwitterAccountService],
  exports: [],
})
export class TwitterModule {}
