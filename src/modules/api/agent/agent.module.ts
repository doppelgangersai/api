import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { AgentService } from './agent.service';

@Module({
  controllers: [AgentController],
  providers: [AgentService],
  imports: [ChatbotModule],
})
export class AgentModule {}
