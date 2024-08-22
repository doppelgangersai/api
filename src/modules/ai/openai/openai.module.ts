import { Module } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { ConfigModule } from '../../config';

@Module({
  providers: [OpenAIService],
  exports: [OpenAIService],
  imports: [ConfigModule],
})
export class OpenAIModule {}
