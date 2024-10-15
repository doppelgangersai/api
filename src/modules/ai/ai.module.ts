import { Module } from '@nestjs/common';
import { OpenAIModule } from './openai/openai.module';
import { AIService } from './ai.service';

@Module({
  imports: [OpenAIModule],
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
