// Handler for Twitter events
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TWITTER_CONNECTED_EVENT } from '../../../../core/constants';
import { TwitterAuthService } from './twitter-auth.service';
import { TUserID } from '../../user/user.types';

@Injectable()
export class TwitterHandler {
  constructor(private readonly twitterAuthService: TwitterAuthService) {}

  @OnEvent(TWITTER_CONNECTED_EVENT)
  async handleTwitterConnected(userId: TUserID) {}
}
