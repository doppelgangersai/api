import { Injectable } from '@nestjs/common';
import { ChatbotService } from '../chatbot/chatbot.service';
import * as Parser from 'rss-parser';
import { AIService } from '../../ai/ai.service';

@Injectable()
export class PosterService {
  private parser = new Parser();

  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly aiService: AIService,
  ) {}

  async parseAndPostByUser(userId: number): Promise<string> {
    const doppelganger = await this.chatbotService.getDoppelgangerChatbot(
      userId,
    );
    return this.parseAndPost(doppelganger.backstory);
  }

  async parseAndPostByChatbot(chatbotId: number): Promise<string> {
    const chatbot = await this.chatbotService.get(chatbotId);
    console.log(chatbot);
    return this.parseAndPost(chatbot.backstory);
  }

  private async parseAndPost(backstory: string): Promise<string> {
    const feed = await this.fetchFeed(
      'https://www.reddit.com/r/programming.rss',
    );
    const post = this.getPost(feed);

    console.log(`Parsed post:
${post.title}

${post.content}`);

    const prompt = this.generatePrompt(backstory, post);
    const rewrittenPost = await this.aiService.processText(prompt);

    console.log(`Rewritten post: ${rewrittenPost}`);
    return rewrittenPost;
  }

  private async fetchFeed(url: string): Promise<Parser.Output<any>> {
    return this.parser.parseURL(url);
  }

  private getPost(feed: Parser.Output<any>): Parser.Item {
    return feed.items[Math.floor(Math.random() * feed.items.length)];
  }

  private generatePrompt(backstory: string, post: Parser.Item): string {
    return `${backstory}

TASK: rewrite the following post to tweet in the style of the chatbot. Ignore links and formatting on content.

POST:
${post.title}

${post.content}

TWEET:
`;
  }
}
