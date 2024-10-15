import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  INSTAGRAM_UPLOADED_EVENT,
  INSTAGRAM_PREPROCESSED_EVENT,
} from '../../../../core/constants';
import { InstagramParserService } from '../services/instagram-parser.service';
import { VaultEmitter } from '../../../api/vault/vault.emitter';

@Injectable()
export class InstagramParserHandler {
  constructor(
    private readonly parserService: InstagramParserService,
    private readonly emitter: VaultEmitter,
  ) {}
  @OnEvent(INSTAGRAM_UPLOADED_EVENT)
  async handleInstagramUploadedEvent(userId: number): Promise<void> {
    await this.parserService.removePhotos(userId);
    this.emitter.emitInstagramPreprocessed(userId);
  }

  @OnEvent(INSTAGRAM_PREPROCESSED_EVENT)
  async handleInstagramPreprocessedEvent(userId: number): Promise<void> {
    await this.parserService.parseUser(userId);
  }
}
