import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '../../config';
import { OPENAI_API_KEY } from '../../../core/constants/environment.constants';

@Injectable()
export class OpenAIService {
  constructor(private readonly configService: ConfigService) {}

  async getResponse(prompt: string, model = 'gpt-4o-mini'): Promise<string> {
    const openai = new OpenAI({
      apiKey: this.configService.get(OPENAI_API_KEY),
    });

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
    });

    return completion.choices[0].message.content;
  }

  async generateImage(prompt: string): Promise<string> {
    const openai = new OpenAI({
      apiKey: this.configService.get(OPENAI_API_KEY),
    });

    const image = await openai.images.generate({
      prompt,
      size: '512x512', // You can set the size here or make it dynamic
    });

    return image.data[0].url; // Returns the URL of the generated image
  }
}
