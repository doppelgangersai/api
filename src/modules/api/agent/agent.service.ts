import {
  ForbiddenException,
  HttpException,
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
  MappedTweet,
  TwitterTimelineResponse,
  TwitterTweet,
  TwitterTweetReference,
  TwitterUser,
} from './agent-twitter.types';
import { TAgentID, UpdateAgentResponseDto } from './agent.controller';

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
  ): Promise<UpdateAgentResponseDto> {
    const chatbot = await this.chatbotService.getChatbotById(agentId);
    if (!chatbot) {
      throw new NotFoundException('Agent not found');
    }

    if (chatbot.creatorId !== userId && chatbot.ownerId !== userId) {
      throw new ForbiddenException('You are not the owner of this agent');
    }

    const {
      twitter_account_id,
      post_settings: {
        enabled: post_enabled,
        accounts: post_accounts,
        keywords: post_keywords,
        prompt: post_prompt,
        per_day: post_per_day,
      },
      comment_settings: {
        enabled: comment_enabled,
        accounts: comment_accounts,
        reply_when_tagged: comment_reply_when_tagged,
        x_accounts_replies: comment_x_accounts_replies,
        my_accounts_replies: comment_my_accounts_replies,
        prompt: comment_prompt,
        min_followers: comment_min_followers,
        older_then: comment_older_then,
        verified_only: comment_verified_only,
      },
    } = settings;

    const updatedChatbot = await this.chatbotService.updateChatbot(agentId, {
      twitterAccountId: twitter_account_id,
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

    return {
      agent: {
        comment_settings: {
          accounts: updatedChatbot.comment_accounts,
          enabled: updatedChatbot.comment_enabled,
          my_accounts_replies: updatedChatbot.comment_my_accounts_replies,
          min_followers: updatedChatbot.comment_min_followers,
          older_then: updatedChatbot.comment_older_then,
          prompt: updatedChatbot.comment_prompt,
          reply_when_tagged: updatedChatbot.comment_reply_when_tagged,
          x_accounts_replies: updatedChatbot.comment_x_accounts_replies,
          verified_only: updatedChatbot.comment_verified_only,
        },
        id: agentId,
        post_settings: {
          accounts: updatedChatbot.post_accounts,
          enabled: updatedChatbot.post_enabled,
          keywords: updatedChatbot.post_keywords,
          per_day: updatedChatbot.post_per_day,
          prompt: updatedChatbot.post_prompt,
        },
        twitter_account_id: updatedChatbot.twitterAccountId,
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

  async getAgentToPost(): Promise<Chatbot[]> {
    return this.chatbotService.getAgentToPost();
  }

  async tick() {
    const agents = await this.getAgentToPost();
    console.log('Posting for agents', agents.length);
    for (const agent of agents) {
      console.log('Posting for account', agent.twitterAccountId);
      let last_checked_tweet_id: string;
      try {
        const twitterAccount =
          await this.twitterAccountService.getAccountWithActualTokens(
            agent.twitterAccountId,
          );

        const timeline = await this.fetchTimeline(
          twitterAccount,
          agent.post_last_checked_tweet_id,
        );

        last_checked_tweet_id = timeline.data[0].id;

        // await new Promise((resolve) => setTimeout(resolve, 15 * 1000));

        if (!timeline?.data) {
          console.error('No timeline data');
          return;
        }
        await this.processAgent(twitterAccount, agent, timeline);
      } catch (e) {
        console.error('Error posting:', e);
        agent.last_agent_error = new Date();
        agent.last_agent_error_message = e.message as string;
        await this.chatbotService.updateChatbot(agent.id, agent);
      }
      if (last_checked_tweet_id) {
        agent.post_last_checked_tweet_id = last_checked_tweet_id;
        await this.chatbotService.updateChatbot(agent.id, agent);
      }
    }
  }

  async fetchTimeline(
    twitterAccount: TwitterAccount,
    post_last_checked_tweet_id?: string,
  ): Promise<TwitterTimelineResponse> {
    console.log('Fetching timeline for account', twitterAccount.twitter_id);
    const options = {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + twitterAccount.access_token },
    };

    const timeline = (await fetch(
      `https://api.x.com/2/users/${
        twitterAccount.twitter_id
      }/timelines/reverse_chronological?user.fields=connection_status,is_identity_verified,verified_type,public_metrics&tweet.fields=conversation_id,referenced_tweets,in_reply_to_user_id&expansions=author_id&max_results=100${
        post_last_checked_tweet_id
          ? '&since_id=' + post_last_checked_tweet_id
          : ''
      }`,
      options,
    )
      .then((response) => response.json())
      .catch((err) => console.error(err))) as TwitterTimelineResponse;

    if (timeline.status === 429) {
      throw new Error('fetchTimeline> Rate limit exceeded');
    }

    return timeline;
  }

  async processAgent(
    account: TwitterAccount,
    agent: Chatbot,
    timeline: TwitterTimelineResponse,
  ) {
    if (
      agent.last_agent_error &&
      agent.last_agent_error.getTime() + 1000 * 60 * 5 > Date.now()
    ) {
      console.error('processAgent> Last error was less then 5 minutes ago');
      // error + 15 min - now
      console.error(
        agent.last_agent_error.getTime() + 1000 * 60 * 5 - Date.now(),
      );

      return;
    }

    if (this.lastTweetCache[account.id] + 1000 * 60 * 5 > Date.now()) {
      console.error('processAgent> Rate limit exceeded');
      return;
    }

    console.log('Timeline data example:', timeline?.data[0]);

    if (agent.post_enabled) {
      await this.processPosts(account, agent, timeline);
      // await new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    }

    if (agent.comment_enabled) {
      await this.processComments(account, agent, timeline);
      // await new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    }
  }

  /**
   * fetchMentions
   */
  async fetchMentions(
    twitterAccount: TwitterAccount,
    since_id?: string,
  ): Promise<TwitterTimelineResponse> {
    console.log('Fetching mentions for account', twitterAccount.twitter_id);
    const options = {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + twitterAccount.access_token },
    };

    const mentions = (await fetch(
      `https://api.x.com/2/users/${
        twitterAccount.twitter_id
      }/mentions?user.fields=connection_status,is_identity_verified,verified_type,public_metrics&tweet.fields=conversation_id,referenced_tweets,in_reply_to_user_id&expansions=author_id${
        since_id ? '&since_id=' + since_id : ''
      }`,
      options,
    )
      .then((response) => response.json())
      .catch((err) => console.error(err))) as TwitterTimelineResponse;

    if (mentions.status === 429) {
      throw new Error('fetchMentions> Rate limit exceeded');
    }

    return mentions;
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
    console.log(tweet.author?.is_identity_verified);

    console.log(
      'Match by followers:',
      matchByFollowers,
      tweet.author?.public_metrics?.followers_count,
      min_followers,
      tweet.author,
    );
    console.log(
      'Match by age:',
      matchByAge,
      tweet.author?.created_at,
      older_then,
    );
    console.log(
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
    timeline: TwitterTimelineResponse,
  ) {
    const { accounts, keywords, prompt, per_day } =
      this.mapAgentToSettings(agent).agent.post_settings;

    const mappedTimeline = this.mapTweets(timeline);
    const tweets = mappedTimeline.filter(
      (tweet) =>
        tweet.author.username !== account.screen_name &&
        tweet.author &&
        (!accounts?.length || accounts.includes(tweet.author.username)) && // есть в списке аккаунтов
        // !this.isQuote(tweet) &&
        // !this.isRetweet(tweet) &&
        !this.isReply(tweet) &&
        this.includesOneOfKeywords(tweet, keywords) &&
        this.isNotAlreadyInteracted(tweet, account.id),
    );

    console.log('Tweets:', tweets.length);

    for (let i = 0; i <= Math.min(tweets.length, 1); i++) {
      const tweet = tweets[i];
      if (!tweet) {
        continue;
      }

      const prompt = this.performPromptForPost(agent, tweet);
      console.log(prompt);
      const postText = await this.aiService.processText(prompt);
      console.log('Post text:', postText);
      this.addToInteractionCache(tweet, account.id);
      await this.tweet(account, postText);
    }
  }

  async processComments(
    account: TwitterAccount,
    agent: Chatbot,
    timeline: TwitterTimelineResponse,
  ) {
    const {
      accounts,
      x_accounts_replies,
      my_accounts_replies,
      reply_when_tagged,
      min_followers,
      older_then,
    } = this.mapAgentToSettings(agent).agent.comment_settings;

    const mappedTimeline = this.mapTweets(timeline);
    if (x_accounts_replies) {
      console.log('X Accounts Replies enabled', accounts);
      const tweets = mappedTimeline
        .filter(
          (tweet) =>
            !accounts?.length ||
            accounts.find(
              (a) => a.toLowerCase() === tweet.author.username.toLowerCase(),
            ),
        )
        .filter((tweet) => {
          console.log(
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
        await this.replyToTweet(account, tweets[0].id, replyText);
      }
    }

    if (my_accounts_replies) {
      const mentions = await this.fetchMentions(
        account,
        agent.post_last_checked_tweet_id,
      );
      const mappedMentions = this.mapTweets(mentions);
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
        await this.replyToTweet(account, tweet.id, replyText);
        console.log('Reply text:', replyText);
      }
    }

    if (reply_when_tagged) {
      const mentions = await this.fetchMentions(
        account,
        agent.post_last_checked_tweet_id,
      );
      const mappedMentions = this.mapTweets(mentions);
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
        await this.replyToTweet(account, tweet.id, replyText);
        console.log('Reply text:', replyText);
      }
    }
  }

  private mapTweets(timeline: TwitterTimelineResponse): (TwitterTweet & {
    author?: TwitterUser;
    extended_referenced_tweets?: Array<
      TwitterTweetReference & {
        tweet?: TwitterTweet & { author?: TwitterUser };
      }
    >;
  })[] {
    if (!timeline.data || !timeline.includes || !timeline.includes.users) {
      return [];
    }

    return timeline.data.map((tweet) => {
      const author = timeline.includes.users.find(
        (user) => user.id === tweet.author_id,
      );

      const extended_referenced_tweets = tweet.referenced_tweets?.map((ref) => {
        const refTweet = timeline.data.find((t) => t.id === ref.id);
        const refAuthor = refTweet
          ? timeline.includes.users.find((u) => u.id === refTweet.author_id)
          : undefined;
        return {
          ...ref,
          tweet: refTweet ? { ...refTweet, author: refAuthor } : undefined,
        };
      });

      return { ...tweet, author, extended_referenced_tweets };
    });
  }

  private isQuote(tweet: TwitterTweet): boolean {
    const isQuote = tweet.referenced_tweets
      ? tweet.referenced_tweets.some((ref) => ref.type === 'quoted')
      : false;

    // console.log('Is quote:', isQuote, tweet.text);
    return isQuote;
  }

  private isRetweet(tweet: TwitterTweet): boolean {
    const isRetweet = tweet.referenced_tweets
      ? tweet.referenced_tweets.some((ref) => ref.type === 'retweeted')
      : false;

    // console.log('Is retweet:', isRetweet, tweet.text);
    return isRetweet;
  }

  private isReply(tweet: TwitterTweet): boolean {
    const isReply = !!tweet.in_reply_to_user_id;

    // console.log('Is reply:', isReply, tweet.text, tweet.in_reply_to_user_id);
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
    if (!keywords?.length) {
      return true;
    }
    // if lowercase tweet text includes lowercase keyword
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
      console.log(this.lastTweetCache[account.id] + 1000 * 60 * 5, Date.now());
      throw new Error('replyToTweet> Rate limit exceeded');
    }
    // await new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    this.lastTweetCache[account.id] = Date.now();
    return this.twitterAccountService.replyToTweet(
      account.access_token,
      tweetId,
      replyText,
    );
  }

  private async tweet(account: TwitterAccount, postText: string) {
    if (this.lastTweetCache[account.id] + 1000 * 60 * 5 > Date.now()) {
      throw new Error('tweet> Rate limit exceeded');
    }
    this.lastTweetCache[account.id] = Date.now();
    // await new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    return this.twitterAccountService.tweet(account.access_token, postText);
  }
}
