import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { INSTAGRAM_UPLOADED_EVENT } from '../../../constants/event-emitter.constants';

@Injectable()
export class VaultEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitInstagramUploaded(userId: number): void {
    this.eventEmitter.emit(INSTAGRAM_UPLOADED_EVENT, userId);
  }
}
