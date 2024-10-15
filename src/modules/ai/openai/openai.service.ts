import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '../../config';
import { OPENAI_API_KEY } from '../../../core/constants/environment.constants';

@Injectable()
export class OpenAIService {
  constructor(private readonly configService: ConfigService) {}

  async getResponse(prompt: string, model: string = 'gpt4o'): Promise<string> {
    const openai = new OpenAI({
      apiKey: this.configService.get(OPENAI_API_KEY),
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return completion.choices[0].message.content;
  }
}
