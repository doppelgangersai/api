import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  INSTAGRAM_PREPROCESSED_EVENT,
  INSTAGRAM_UPLOADED_EVENT,
  TELEGRAM_UPLOADED_EVENT,
} from '../../../constants/event-emitter.constants';

@Injectable()
export class VaultEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitInstagramPreprocessed(userId: number): void {
    this.eventEmitter.emit(INSTAGRAM_PREPROCESSED_EVENT, userId);
  }
  emitInstagramUploaded(userId: number): void {
    this.eventEmitter.emit(INSTAGRAM_UPLOADED_EVENT, userId);
  }

  emitTelegramConnected(userId: number): void {
    this.eventEmitter.emit(TELEGRAM_UPLOADED_EVENT, userId);
  }
}
