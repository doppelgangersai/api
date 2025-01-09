import { Injectable } from '@nestjs/common';
import { OpenAIService } from './openai/openai.service';
import { getUniqueStrings } from '../../utils/unique';
import { z, ZodSchema } from 'zod';

export interface MessagesWithTitle {
  title: string;
  messages: string[];
}

@Injectable()
export class AIService {
  constructor(private readonly openAIService: OpenAIService) {}

  async processText(prompt: string) {
    return this.openAIService.getResponse(prompt);
  }

  async processTextWithValidation<T>(
    prompt: string,
    schema: ZodSchema<T>,
  ): Promise<T> {
    return this.openAIService.processTextWithValidation<T>(prompt, schema);
  }

  async getBackstoryByMessagesPack(
    messages: MessagesWithTitle[],
    maxForBlock = 15,
    minDistance = 0.7,
  ): Promise<string> {
    const filteredMessages = messages.map((m) => ({
      title: m.title,
      messages: getUniqueStrings(m.messages, maxForBlock, minDistance),
    }));
    const prefix =
      'Generate a comprehensive profile description using the following information:';
    const suffix =
      // eslint-disable-next-line max-len
      '\nPlease provide a detailed summary and analysis based on the above data. \nCommunication examples are matter.\nBe careful with sensitive information and make sure the output is suitable for public consumption.\nResult should be an instruction for users digital twin chatbot.\n';
    const prompt = `${prefix}
    ${filteredMessages
      .map((m) => `${m.title}:\n${m.messages.join('\n')}`)
      .join('\n\n')}}
    ${suffix}`;
    return this.openAIService.getResponse(prompt);
  }

  async getProfileDescription(
    personalInfo: { [key: string]: string },
    posts: string[],
    comments: string[],
    reelsComments: string[],
    inbox: string[],
  ): Promise<string> {
    const prompt = this.createPrompt(
      personalInfo,
      getUniqueStrings(posts, 10, 0.7),
      getUniqueStrings(comments, 15, 0.7),
      getUniqueStrings(reelsComments, 5, 0.7),
      getUniqueStrings(inbox, 15, 0.4),
    );
    return this.openAIService.getResponse(prompt);
  }

  private createPrompt(
    personalInfo: { [key: string]: string },
    posts: string[],
    comments: string[],
    reelsComments: string[],
    inbox: string[],
  ): string {
    const infoString = Object.entries(personalInfo)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const postsString = posts.join('\n');
    const commentsString = comments.join('\n');
    const reelsCommentsString = reelsComments.join('\n');
    const inboxString = inbox.join('\n');

    return `Generate a comprehensive profile description using the following information:
Personal Information:
${infoString}

Top Posts:
${postsString}

Top Comments:
${commentsString}

Top Reels Comments:
${reelsCommentsString}

Top Inbox Messages:
${inboxString}

Please provide a detailed summary and analysis based on the above data.
Be careful with sensitive information and make sure the output is suitable for public consumption.
Result should be an instruction for users digital twin chatbot.
`;
  }

  async generateImage(prompt: string) {
    return this.openAIService.generateImage(prompt);
  }
}
