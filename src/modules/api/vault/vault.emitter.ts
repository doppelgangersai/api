import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  INSTAGRAM_PREPROCESSED_EVENT,
  INSTAGRAM_UPLOADED_EVENT,
  TELEGRAM_UPLOADED_EVENT,
  TWITTER_CONNECTED_EVENT,
} from '../../../core/constants';
import { TUserID } from '../user/user.types';

@Injectable()
export class VaultEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitInstagramPreprocessed(userId: TUserID): void {
    this.eventEmitter.emit(INSTAGRAM_PREPROCESSED_EVENT, userId);
  }
  emitInstagramUploaded(userId: TUserID): void {
    this.eventEmitter.emit(INSTAGRAM_UPLOADED_EVENT, userId);
  }

  emitTelegramConnected(userId: TUserID): void {
    this.eventEmitter.emit(TELEGRAM_UPLOADED_EVENT, userId);
  }

  emitTwitterConnected(userId: TUserID): void {
    this.eventEmitter.emit(TWITTER_CONNECTED_EVENT, userId);
  }
}
