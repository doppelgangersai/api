import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatbotService } from '../chatbot/chatbot.service';
import {
  ICommentSettings,
  IPostSettings,
  IUpdateAgent,
} from './interfaces/update-agent.interface';
import { TwitterAccountService } from '../twitter/twitter-account.service';
import { AIService } from '../../ai/ai.service';
import { Chatbot } from '../chatbot/chatbot.entity';
import { TwitterAccount } from '../twitter/twitter-account.entity';
import {
  TwitterTweet,
  TwitterTweetReference,
  TwitterUser,
} from './agent-twitter.types';
import { TAgentID } from './agent.controller';
import { GetAgentResponseDto } from './agent.dtos';
import * as fs from 'node:fs';
import { shuffleArray } from '../../../utils/random';

const log = console.log;
const error_log = console.error;

export type MappedTweet = TwitterTweet & {
  author?: TwitterUser;
  extended_referenced_tweets?: Array<
    TwitterTweetReference & {
      tweet?: TwitterTweet & { author?: TwitterUser };
    }
  >;
};

@Injectable()
export class AgentService {
  private interactionCache: Record<string, TwitterTweet[]>;
  private lastTweetCache: Record<string, number>;
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly twitterAccountService: TwitterAccountService,
    private readonly aiService: AIService,
  ) {
    this.interactionCache = {};
    this.lastTweetCache = {};
  }

  async updateAgentSettings(
    agentId: number,
    userId: number,
    settings: IUpdateAgent,
  ): Promise<GetAgentResponseDto> {
    const chatbot = await this.chatbotService.getChatbotById(agentId);
    if (!chatbot) {
      throw new NotFoundException('Agent not found');
    }

    if (chatbot.creatorId !== userId && chatbot.ownerId !== userId) {
      throw new ForbiddenException('You are not the owner of this agent');
    }

    const experimental =
      settings.experimental ?? chatbot.agent_experimental ?? false;
    const twitter_account_id =
      settings.twitter_account_id ?? chatbot.twitterAccountId;
    const enabled = settings.enabled ?? chatbot.agent_enabled ?? false;

    const postSettingsInput = settings.post_settings ?? ({} as IPostSettings);
    const post_enabled =
      postSettingsInput.enabled ?? chatbot.post_enabled ?? false;
    const post_accounts = postSettingsInput.accounts ?? chatbot.post_accounts;
    const post_keywords = postSettingsInput.keywords ?? chatbot.post_keywords;
    const post_prompt = postSettingsInput.prompt ?? chatbot.post_prompt;
    const post_per_day = postSettingsInput.per_day ?? chatbot.post_per_day;

    const commentSettingsInput =
      settings.comment_settings ?? ({} as ICommentSettings);
    const comment_enabled =
      commentSettingsInput.enabled ?? chatbot.comment_enabled ?? false;
    const comment_accounts =
      commentSettingsInput.accounts ?? chatbot.comment_accounts;
    const comment_reply_when_tagged =
      commentSettingsInput.reply_when_tagged ??
      chatbot.comment_reply_when_tagged ??
      false;
    const comment_x_accounts_replies =
      commentSettingsInput.x_accounts_replies ??
      chatbot.comment_x_accounts_replies ??
      false;
    const comment_my_accounts_replies =
      commentSettingsInput.my_accounts_replies ??
      chatbot.comment_my_accounts_replies ??
      false;
    const comment_prompt =
      commentSettingsInput.prompt ?? chatbot.comment_prompt;
    const comment_min_followers =
      commentSettingsInput.min_followers ?? chatbot.comment_min_followers;
    const comment_older_then =
      commentSettingsInput.older_then ?? chatbot.comment_older_then;
    const comment_verified_only =
      commentSettingsInput.verified_only ??
      chatbot.comment_verified_only ??
      false;

    const updatedChatbot = await this.chatbotService.updateChatbot(agentId, {
      agent_experimental: experimental,
      twitterAccountId: twitter_account_id,
      agent_enabled: enabled,
      post_enabled,
      post_accounts,
      post_keywords,
      post_prompt,
      post_per_day,
      comment_enabled,
      comment_accounts,
      comment_reply_when_tagged,
      comment_x_accounts_replies,
      comment_my_accounts_replies,
      comment_prompt,
      comment_min_followers,
      comment_older_then,
      comment_verified_only,
    });

    await this.resetSession(agentId);

    return {
      agent: {
        id: agentId,
        creatorId: updatedChatbot.creatorId,
        ownerId: updatedChatbot.ownerId,
        twitter_account_id: updatedChatbot.twitterAccountId,
        experimental: updatedChatbot.agent_experimental ?? false,
        enabled: updatedChatbot.agent_enabled ?? false,
      },
      post_settings: {
        enabled: updatedChatbot.post_enabled ?? false,
        accounts: updatedChatbot.post_accounts,
        keywords: updatedChatbot.post_keywords,
        prompt: updatedChatbot.post_prompt,
        per_day: updatedChatbot.post_per_day,
      },
      comment_settings: {
        enabled: updatedChatbot.comment_enabled ?? false,
        accounts: updatedChatbot.comment_accounts,
        reply_when_tagged: updatedChatbot.comment_reply_when_tagged ?? false,
        x_accounts_replies: updatedChatbot.comment_x_accounts_replies ?? false,
        my_accounts_replies:
          updatedChatbot.comment_my_accounts_replies ?? false,
        prompt: updatedChatbot.comment_prompt,
        min_followers: updatedChatbot.comment_min_followers,
        older_then: updatedChatbot.comment_older_then,
        verified_only: updatedChatbot.comment_verified_only ?? false,
      },
    };
  }

  mapAgentToSettings = (chatbot: Chatbot) => {
    return {
      agent: {
        comment_settings: {
          accounts: chatbot.comment_accounts, // list of accounts to comment
          enabled: chatbot.comment_enabled,
          my_accounts_replies: chatbot.comment_my_accounts_replies, //
          min_followers: chatbot.comment_min_followers, // author's followers count
          older_then: chatbot.comment_older_then, // author's account age in years
          prompt: chatbot.comment_prompt, // string
          reply_when_tagged: chatbot.comment_reply_when_tagged, // boolean
          x_accounts_replies: chatbot.comment_x_accounts_replies, // boolean
        } as ICommentSettings,
        creatorId: chatbot.creatorId,
        id: chatbot.id,
        ownerId: chatbot.ownerId,
        post_settings: {
          accounts: chatbot.post_accounts,
          enabled: chatbot.post_enabled,
          keywords: chatbot.post_keywords,
          per_day: chatbot.post_per_day,
          prompt: chatbot.post_prompt,
        } as IPostSettings,
        twitter_account_id: chatbot.twitterAccountId,
      },
    };
  };

  async resetSession(agentId: TAgentID) {
    await this.chatbotService.resetAgentSession(agentId);
  }

  async getAgentSettings(agentId: number, userId: number) {
    const chatbot = await this.chatbotService.getChatbotById(agentId);
    if (!chatbot) {
      throw new NotFoundException('Agent not found');
    }

    if (chatbot.creatorId !== userId && chatbot.ownerId !== userId) {
      throw new ForbiddenException('You are not the owner of this agent');
    }

    return {
      agent: {
        id: agentId,
        creatorId: chatbot.creatorId,
        ownerId: chatbot.ownerId,
        twitter_account_id: chatbot.twitterAccountId,
        enabled: chatbot.agent_enabled,
        experimental: true,
      },
      comment_settings: {
        accounts: chatbot.comment_accounts,
        enabled: chatbot.comment_enabled,
        my_accounts_replies: chatbot.comment_my_accounts_replies,
        min_followers: chatbot.comment_min_followers,
        older_then: chatbot.comment_older_then,
        prompt: chatbot.comment_prompt,
        reply_when_tagged: chatbot.comment_reply_when_tagged,
        x_accounts_replies: chatbot.comment_x_accounts_replies,
        verified_only: chatbot.comment_verified_only,
      },
      post_settings: {
        accounts: chatbot.post_accounts,
        enabled: chatbot.post_enabled,
        keywords: chatbot.post_keywords,
        per_day: chatbot.post_per_day,
        prompt: chatbot.post_prompt,
      },
    };
  }

  async getAgentsToPost(): Promise<Chatbot[]> {
    return this.chatbotService.getAgentToPost();
  }

  async tick() {
    const agents = await this.getAgentsToPost();
    log('Posting for agents', agents.length);
    for (const agent of agents) {
      await this.processAgent(agent).catch((e) =>
        error_log(
          'Error processing agent:',
          agent.id,
          agent.twitterAccountId,
          agent.twitterUsername,
          e.message,
        ),
      );
    }
  }

  async processAgent(agent: Chatbot): Promise<void> {
    log('Posting for account', agent.twitterAccountId);
    if (!agent.agent_enabled) {
      error_log('processAgent> Agent is disabled');
      return;
    }

    console.log({
      comment_enabled: agent.comment_enabled,
      post_enabled: agent.post_enabled,
    });

    try {
      const twitterAccount =
        await this.twitterAccountService.getAccountWithActualTokens(
          agent.twitterAccountId,
        );

      if (
        agent.last_agent_error &&
        agent.last_agent_error.getTime() + 1000 * 60 * 5 > Date.now()
      ) {
        error_log('processAgent> Last error was less than 5 minutes ago');
        error_log(
          agent.last_agent_error.getTime() + 1000 * 60 * 5 - Date.now(),
        );
        return;
      }

      if (this.lastTweetCache[twitterAccount.id] + 1000 * 60 * 5 > Date.now()) {
        error_log('processAgent> Rate limit protection');
        return;
      }

      const tweetsForPosting =
        agent.post_enabled && agent.post_accounts
          ? await this.twitterAccountService.getTweetsByList(
              agent.post_accounts,
              twitterAccount,
              agent.post_last_checked_tweet_id,
            )
          : [];

      const tweetsForComments =
        agent.comment_enabled &&
        agent.comment_x_accounts_replies &&
        agent.comment_accounts
          ? await this.twitterAccountService.getTweetsByList(
              agent.comment_accounts,
              twitterAccount,
              agent.post_last_checked_tweet_id,
            )
          : [];

      const posts = await this.processPosts(
        twitterAccount,
        agent,
        tweetsForPosting,
      );
      const comments = await this.processComments(
        twitterAccount,
        agent,
        tweetsForComments,
      );

      agent.post_session_count = (agent.post_session_count ?? 0) + posts;
      agent.comment_session_count =
        (agent.comment_session_count ?? 0) + comments;

      const allTweets = this.twitterAccountService.flattenUniqueMappedTweets([
        tweetsForComments,
        tweetsForPosting,
      ]);

      const maxId = this.twitterAccountService.getMaxTweetId(allTweets);

      if (maxId?.length) {
        agent.post_last_checked_tweet_id = maxId;
      }

      await this.chatbotService.updateChatbot(agent.id, agent);
    } catch (e) {
      error_log('Error posting:', e);
      agent.last_agent_error = new Date();
      agent.last_agent_error_message = e.message as string;
      await this.chatbotService.updateChatbot(agent.id, agent);
    }
  }

  async processAgentById(agentId: number): Promise<void> {
    const agent = await this.chatbotService.getChatbotById(agentId);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    await this.processAgent(agent);
  }

  async processAgentsByUserId(userId: number): Promise<void> {
    const agents = await this.chatbotService.getAvailableChatbots(userId);
    for (const agent of agents) {
      await this.processAgent(agent);
    }
  }

  isAuthorMatchRequirements(
    tweet: MappedTweet,
    min_followers: number,
    older_then: number,
    verified: boolean,
  ): boolean {
    const matchByFollowers =
      !min_followers ||
      tweet.author?.public_metrics?.followers_count >= min_followers;
    const matchByAge =
      tweet.author?.created_at &&
      new Date(tweet.author.created_at) <
        new Date(Date.now() - older_then * 365 * 24 * 3600 * 1000);
    const matchByVerified = !verified || tweet.author?.is_identity_verified;
    log(tweet.author?.is_identity_verified);

    log(
      'Match by followers:',
      matchByFollowers,
      tweet.author?.public_metrics?.followers_count,
      min_followers,
      tweet.author,
    );
    log('Match by age:', matchByAge, tweet.author?.created_at, older_then);
    log(
      'Match by verified:',
      matchByVerified,
      tweet.author?.is_identity_verified,
      verified,
    );

    return (
      tweet.author?.public_metrics?.followers_count >= min_followers &&
      tweet.author?.created_at &&
      new Date(tweet.author.created_at) <
        new Date(Date.now() - older_then * 365 * 24 * 3600 * 1000) &&
      (!verified || tweet.author?.is_identity_verified)
    );
  }
  async processPosts(
    account: TwitterAccount,
    agent: Chatbot,
    mappedTimeline: MappedTweet[],
  ): Promise<number> {
    let posts = 0;
    const { accounts, keywords } =
      this.mapAgentToSettings(agent).agent.post_settings;

    const tweets = mappedTimeline.filter(
      (tweet) =>
        tweet.author.username !== account.screen_name &&
        tweet.author &&
        (!accounts?.length || accounts.includes(tweet.author.username)) && // есть в списке аккаунтов
        !this.isReply(tweet) &&
        this.includesOneOfKeywords(tweet, keywords) &&
        this.isNotAlreadyInteracted(tweet, account.id),
    );

    log('Tweets:', tweets.length);

    for (let i = 0; i <= Math.min(tweets.length, 1); i++) {
      const tweet = tweets[i];
      if (!tweet) {
        continue;
      }

      const prompt = this.performPromptForPost(agent, tweet);
      const postText = await this.aiService.processText(prompt);
      log(`@${tweet.author.username}:`, tweet.text);
      log(`@${account.screen_name}:`, postText);
      this.addToInteractionCache(tweet, account.id);
      await this.tweet(account, postText).then(() => posts++);
    }

    return posts;
  }

  async processComments(
    account: TwitterAccount,
    agent: Chatbot,
    mappedTimeline: MappedTweet[],
  ): Promise<number> {
    let comments = 0;
    const {
      accounts,
      x_accounts_replies,
      my_accounts_replies,
      reply_when_tagged,
      min_followers,
      older_then,
    } = this.mapAgentToSettings(agent).agent.comment_settings;

    if (x_accounts_replies) {
      log('X Accounts Replies enabled', accounts);
      const tweets = mappedTimeline
        .filter(
          (tweet) =>
            !accounts?.length ||
            accounts.find(
              (a) => a.toLowerCase() === tweet.author.username.toLowerCase(),
            ),
        )
        .filter((tweet) => {
          log(
            'Tweet:',
            tweet.author.username,
            tweet.text,
            tweet.author.id,
            account.id,
            this.isNotAlreadyInteracted(tweet, account.id),
          );
          return (
            tweet.author.username !== account.screen_name &&
            // !this.isQuote(tweet) &&
            !this.isRetweet(tweet) &&
            !this.isReply(tweet) &&
            this.isNotAlreadyInteracted(tweet, account.id)
          );
        });

      for (let i = 0; i <= Math.min(tweets.length, 1); i++) {
        const tweet = tweets[i];
        if (!tweet) {
          continue;
        }
        const prompt = this.performPromptForComment(agent, tweet);
        const replyText = await this.aiService.processText(prompt);
        this.addToInteractionCache(tweet, account.id);
        await this.replyToTweet(account, tweets[0].id, replyText).then(
          () => comments++,
        );
      }
    }

    if (my_accounts_replies) {
      const mentions = await this.twitterAccountService.fetchMentions(
        account,
        agent.post_last_checked_tweet_id,
      );
      const mappedMentions = this.twitterAccountService.mapTweets(mentions);
      const filteredMentions = mappedMentions.filter(
        (tweet) =>
          tweet.author &&
          !this.isQuote(tweet) &&
          !this.isRetweet(tweet) &&
          this.isAuthorMatchRequirements(
            tweet,
            min_followers,
            older_then,
            agent.comment_verified_only,
          ),
      );

      for (let i = 0; i <= Math.min(filteredMentions.length, 1); i++) {
        const tweet = filteredMentions[i];
        if (!tweet) {
          continue;
        }
        const prompt = this.performPromptForComment(agent, tweet);
        const replyText = await this.aiService.processText(prompt);
        this.addToInteractionCache(tweet, account.id);
        await this.replyToTweet(account, tweet.id, replyText).then(
          () => comments++,
        );
        log('Reply text:', replyText);
      }
    }

    if (reply_when_tagged) {
      const mentions = await this.twitterAccountService.fetchMentions(
        account,
        agent.post_last_checked_tweet_id,
      );
      const mappedMentions = this.twitterAccountService.mapTweets(mentions);
      const filteredMentions = mappedMentions.filter(
        (tweet) =>
          tweet.author &&
          !this.isQuote(tweet) &&
          !this.isRetweet(tweet) &&
          this.isAuthorMatchRequirements(
            tweet,
            min_followers,
            older_then,
            agent.comment_verified_only,
          ),
      );

      for (let i = 0; i <= Math.min(filteredMentions.length, 1); i++) {
        const tweet = filteredMentions[i];
        if (!tweet) {
          continue;
        }
        const prompt = this.performPromptForComment(agent, tweet);
        const replyText = await this.aiService.processText(prompt);
        this.addToInteractionCache(tweet, account.id);
        await this.replyToTweet(account, tweet.id, replyText).then(
          () => comments++,
        );
        log('Reply text:', replyText);
      }
    }
    return comments;
  }

  private isQuote(tweet: TwitterTweet): boolean {
    const isQuote = tweet.referenced_tweets
      ? tweet.referenced_tweets.some((ref) => ref.type === 'quoted')
      : false;

    // log('Is quote:', isQuote, tweet.text);
    return isQuote;
  }

  private isRetweet(tweet: TwitterTweet): boolean {
    const isRetweet = tweet.referenced_tweets
      ? tweet.referenced_tweets.some((ref) => ref.type === 'retweeted')
      : false;

    // log('Is retweet:', isRetweet, tweet.text);
    return isRetweet;
  }

  private isReply(tweet: TwitterTweet): boolean {
    const isReply = !!tweet.in_reply_to_user_id;

    // log('Is reply:', isReply, tweet.text, tweet.in_reply_to_user_id);
    return isReply;
  }

  private isNotAlreadyInteracted(
    tweet: TwitterTweet,
    agentId: string | number,
  ): boolean {
    const agentIdStr = agentId.toString();
    if (!this.interactionCache[agentIdStr]?.length) {
      return true;
    }
    return !this.interactionCache[agentIdStr]?.find((t) => t.id === tweet.id);
  }

  private includesOneOfKeywords(
    tweet: TwitterTweet,
    keywords: string[],
  ): boolean {
    console.log('Checking for keywords', tweet, keywords);
    if (!keywords?.length) {
      return true;
    }
    return keywords.some((keyword) =>
      tweet.text.toLowerCase().includes(keyword.toLowerCase()),
    );
  }

  private isReplyToMe(tweet: TwitterTweet, myUserId: string): boolean {
    return tweet.in_reply_to_user_id === myUserId;
  }
  private addToInteractionCache(tweet: TwitterTweet, agentId: TAgentID) {
    const agentIdStr = agentId.toString();
    if (!this.interactionCache[agentIdStr]) {
      this.interactionCache[agentIdStr] = [];
    }
  }

  private performPromptForComment(
    agent: Chatbot,
    tweet: TwitterTweet & { author?: TwitterUser },
  ): string {
    return `${agent.backstory}
${
  agent.comment_prompt
    ? `User (as customer) added requirement:
${agent.comment_prompt}`
    : ''
}

You will have a tweet on input and you will need to generate a single reply, which will be immediately automatically posted as a reply to the tweet.
Use language of tweet. Avoid hashtags.

${tweet.author?.username} tweeted:
${tweet.text}

Reply:`;
  }
  private performPromptForPost(
    agent: Chatbot,
    tweet: TwitterTweet & { author?: TwitterUser },
  ): string {
    return `${agent.backstory}
${
  agent.comment_prompt
    ? `User (as customer) added requirement:
${agent.comment_prompt}`
    : ''
}

You will have a tweet on input and you will need to rewrite it in style based on backstory, which will be immediately automatically posted.
Use language of tweet. Avoid hashtags.

Tweet:
${tweet.text}

Rewrite:`;
  }

  private async replyToTweet(
    account: TwitterAccount,
    tweetId: string,
    replyText: string,
  ) {
    if (this.lastTweetCache[account.id] + 1000 * 60 * 5 > Date.now()) {
      log(this.lastTweetCache[account.id] + 1000 * 60 * 5, Date.now());
      throw new Error('replyToTweet> Rate limit protection');
    }
    this.lastTweetCache[account.id] = Date.now();
    return this.twitterAccountService.replyToTweet(
      account.access_token,
      tweetId,
      replyText,
    );
  }

  private async tweet(account: TwitterAccount, postText: string) {
    if (this.lastTweetCache[account.id] + 1000 * 60 * 5 > Date.now()) {
      throw new Error('tweet> Rate limit protection');
    }
    this.lastTweetCache[account.id] = Date.now();
    return this.twitterAccountService.tweet(account.access_token, postText);
  }
}
