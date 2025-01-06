import { Injectable } from '@nestjs/common';
import { ChatbotService } from '../chatbot/chatbot.service';
import * as Parser from 'rss-parser';
import { AIService } from '../../ai/ai.service';
import { TwitterAuthService } from '../vault/twitter/twitter-auth.service';
import { User } from '../user';

@Injectable()
export class PosterService {
  private parser = new Parser();

  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly aiService: AIService,
    private readonly twitterAuthService: TwitterAuthService,
  ) {}

  async parseAndPostByUser(user: Partial<User>): Promise<string> {
    const doppelganger = await this.chatbotService.getDoppelgangerChatbot(
      user.id,
    );
    const accessToken = await this.twitterAuthService.refreshAccessToken(
      user.twitterRefreshToken,
    );
    return this.parseAndPost(doppelganger.backstory, accessToken);
  }

  async parseAndPostByChatbot(chatbotId: number): Promise<string> {
    const chatbot = await this.chatbotService.get(chatbotId);
    console.log(chatbot);
    return this.parseAndPost(chatbot.backstory);
  }

  private async parseAndPost(
    backstory: string,
    accessToken?: string,
  ): Promise<string> {
    const feed = await this.fetchFeed(
      'https://www.reddit.com/r/programming.rss',
    );
    const post = this.getPost(feed);

    console.log(`Parsed post:
${post.title}

${post.content}`);

    const prompt = this.generatePrompt(backstory, post);
    const rewrittenPost = await this.aiService.processText(prompt);

    if (accessToken) {
      await this.twitterAuthService.tweet(accessToken, rewrittenPost);
    }

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
