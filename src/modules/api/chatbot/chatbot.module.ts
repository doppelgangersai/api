import { Module } from '@nestjs/common';
import { AIModule } from '../../ai/ai.module';
import { ChatbotService } from './chatbot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chatbot } from './chatbot.entity';
import { UserModule } from '../user';
import { ChatbotController } from './chatbot.controller';
@Module({
  imports: [AIModule, UserModule, TypeOrmModule.forFeature([Chatbot])],
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
