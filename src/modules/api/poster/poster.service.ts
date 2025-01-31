import { Injectable } from '@nestjs/common';
import { ChatbotService } from '../chatbot/chatbot.service';
import * as Parser from 'rss-parser';
import { AIService } from '../../ai/ai.service';
import { VaultTwitterAuthService } from '../vault/twitter/vault-twitter-auth.service';
import { User } from '../user';
import { z } from 'zod';

@Injectable()
export class PosterService {
  private parser = new Parser();

  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly aiService: AIService,
    private readonly vaultTwitterAuthService: VaultTwitterAuthService,
  ) {}

  async tweet(user: Partial<User>, tweet: string): Promise<string> {
    console.log(`Tweeting: ${tweet}`, user);
    const accessToken = await this.vaultTwitterAuthService.refreshAccessToken(
      user.twitterRefreshToken,
    );
    await this.vaultTwitterAuthService.tweet(accessToken, tweet);
    return tweet;
  }

  async parseAndPostByUser(user: Partial<User>): Promise<string> {
    const doppelganger = await this.chatbotService.getDoppelgangerChatbot(
      user.id,
    );
    const accessToken = await this.vaultTwitterAuthService.refreshAccessToken(
      user.twitterRefreshToken,
    );
    return this.parseAndPost(doppelganger.backstory, accessToken);
  }

  async parseAndPostByChatbot(chatbotId: number): Promise<string> {
    const chatbot = await this.chatbotService.get(chatbotId);
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
      await this.vaultTwitterAuthService.tweet(accessToken, rewrittenPost);
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

TASK: rewrite the following post to tweet in the style of the chatbot. Provide 4 different options (funny, serious, hopeful and professional) formatted as JSON.

POST:
${post.title}

${post.content}


Use only one language per variant.

Format your response as JSON with the following structure:

{
  "variants": [
    "variant1",
    "variant2",
    "variant3",
    "variant4"
  ]
}
`;
  }

  async getVariants(user: Partial<User>): Promise<{ variants: string[] }> {
    const feed = await this.fetchFeed(
      'https://www.reddit.com/r/programming.rss',
    );
    const post = this.getPost(feed);

    console.log(`Parsed post:
${post.title}

${post.content}`);

    const prompt = this.generatePrompt(user.backstory, post);

    // Define Zod schema
    const VariantsSchema = z.object({
      variants: z.array(z.string()).length(4),
    });

    // Use AIService to parse response with Zod validation
    const variants = await this.aiService.processTextWithValidation(
      prompt,
      VariantsSchema,
    );

    console.log(`Generated variants: ${JSON.stringify(variants)}`);
    return { variants: variants.variants };
  }
}
