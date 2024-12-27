import { Module } from '@nestjs/common';
import { PosterController } from './poster.controller';
import { PosterService } from './poster.service';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { AIModule } from '../../ai/ai.module';

@Module({
  imports: [AIModule, ChatbotModule],
  controllers: [PosterController],
  providers: [PosterService],
  exports: [],
})
export class PosterModule {}
