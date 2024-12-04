import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UserModule } from '../user';
import { ConfigModule } from '../../config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './chat.entity';
import { ChatbotModule } from '../chatbot/chatbot.module';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    ChatbotModule,
    TypeOrmModule.forFeature([Chat]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [],
})
export class ChatModule {}
