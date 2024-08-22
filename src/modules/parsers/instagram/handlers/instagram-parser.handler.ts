import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { INSTAGRAM_UPLOADED_EVENT } from '../../../../constants/event-emitter.constants';
import { InstagramParserService } from '../services/instagram-parser.service';

@Injectable()
export class InstagramParserHandler {
  constructor(private readonly parserService: InstagramParserService) {}
  @OnEvent(INSTAGRAM_UPLOADED_EVENT)
  async handleInstagramUploadedEvent(userId: number): Promise<void> {
    await this.parserService.parseUser(userId);
  }
}
