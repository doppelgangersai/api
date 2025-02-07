import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TWITTER_ACCOUNT_CREATED_EVENT } from '../../../core/constants';

@Injectable()
export class TwitterAccountEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}
  emitTwitterAccountCreated(userId: number): void {
    this.eventEmitter.emit(TWITTER_ACCOUNT_CREATED_EVENT, userId);
  }
}
