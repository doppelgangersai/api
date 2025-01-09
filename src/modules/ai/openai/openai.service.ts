import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '../../config';
import { OPENAI_API_KEY } from '../../../core/constants/environment.constants';
import { ZodSchema } from 'zod';

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

  async processTextWithValidation<T>(
    prompt: string,
    schema: ZodSchema<T>,
  ): Promise<T> {
    const openai = new OpenAI({
      apiKey: this.configService.get(OPENAI_API_KEY),
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const response = completion.choices[0].message?.content;

    if (!response) {
      throw new Error('Empty response from AI');
    }

    try {
      return schema.parse(JSON.parse(response));
    } catch (err) {
      console.error('Validation error:', err);
      throw new Error('Response validation failed');
    }
  }

  async getResponseJSON(
    prompt: string,
    model = 'gpt-4o-mini',
  ): Promise<string> {
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
