import { Module } from '@nestjs/common';
import { TwitterAccountController } from './twitter-accounts.controller';

@Module({
  imports: [],
  controllers: [TwitterAccountController],
  providers: [],
  exports: [],
})
export class TwitterModule {}
