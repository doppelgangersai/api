// Handler for Twitter events
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TWITTER_CONNECTED_EVENT } from '../../../../core/constants';
import { VaultTwitterAuthService } from './vault-twitter-auth.service';
import { TUserID } from '../../user/user.types';

@Injectable()
export class TwitterHandler {
  constructor(private readonly twitterAuthService: VaultTwitterAuthService) {}

  @OnEvent(TWITTER_CONNECTED_EVENT)
  async handleTwitterConnected(userId: TUserID) {}
}
