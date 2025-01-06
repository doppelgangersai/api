import { Module } from '@nestjs/common';
import { PosterController } from './poster.controller';
import { PosterService } from './poster.service';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { AIModule } from '../../ai/ai.module';
import { VaultModule } from '../vault/vault.module';
import { UserModule } from '../user';

@Module({
  imports: [AIModule, ChatbotModule, VaultModule, UserModule],
  controllers: [PosterController],
  providers: [PosterService],
  exports: [],
})
export class PosterModule {}
