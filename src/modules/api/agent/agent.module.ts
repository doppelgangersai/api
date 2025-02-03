import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { AgentService } from './agent.service';
import { AgentPostJob } from './jobs/agent-post.job';
import { TwitterModule } from '../twitter/twitter.module';
import { AIModule } from '../../ai/ai.module';

@Module({
  controllers: [AgentController],
  providers: [AgentService, AgentPostJob],
  imports: [ChatbotModule, TwitterModule, AIModule],
})
export class AgentModule {}
