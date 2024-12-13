// Handler for Twitter events
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TWITTER_CONNECTED_EVENT } from '../../../../core/constants';
import { TwitterAuthService } from './twitter-auth.service';

@Injectable()
export class TwitterHandler {
  constructor(private readonly twitterAuthService: TwitterAuthService) {}

  @OnEvent(TWITTER_CONNECTED_EVENT)
  public async twitterConnected(userId: number): Promise<void> {
    console.log('Handling Twitter connection event for user ID', userId);
    try {
      await this.twitterAuthService.processUserTwitter(userId);
      console.log(
        `Twitter connected and chatbot created for user ID ${userId}`,
      );
    } catch (error) {
      console.error(
        `Error handling Twitter connection for user ID ${userId}:`,
        error.message,
      );
    }
  }
}
