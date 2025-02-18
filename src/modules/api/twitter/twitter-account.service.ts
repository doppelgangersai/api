import { HttpException, Injectable } from '@nestjs/common';
import { TwitterAccount } from './twitter-account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TUserID } from '../user/user.types';
import { TwitterAuthService } from './twitter-auth.service';
import axios from 'axios';
import { ConfigService } from '../../config';
import fetch from 'node-fetch';
import {
  TwitterTimelineResponse,
  TwitterTweet,
  TwitterTweetReference,
  TwitterUser,
} from '../agent/agent-twitter.types';
import { OnEvent } from '@nestjs/event-emitter';
import { TWITTER_ACCOUNT_CREATED_EVENT } from '../../../core/constants';
import { TwitterAccountEmitter } from './twitter-account.emitter';
import { MappedTweet } from '../agent/agent.service';

const log = console.log;

@Injectable()
export class TwitterAccountService {
  private followingCache: Record<string, any[]> = {};
  private followingCacheExpiry: Record<string, Date> = {};
  private twitterIdCache: Record<string, string> = {};
  private cachedTweets: Record<
    string,
    {
      lastCheckedTweetId: string;
      tweets: Record<string, any>;
    }
  > = {};
  constructor(
    @InjectRepository(TwitterAccount)
    private readonly twitterAccountRepository: Repository<TwitterAccount>,
    private readonly twitterAuthService: TwitterAuthService,
    private readonly configService: ConfigService,
    private readonly twitterAccountEmitter: TwitterAccountEmitter,
  ) {}

  async getAccountById(accountId: number): Promise<TwitterAccount> {
    return this.twitterAccountRepository.findOne(accountId);
  }

  async getUserAccounts(userId: number): Promise<TwitterAccount[]> {
    return this.twitterAccountRepository.find({ where: { user_id: userId } });
  }

  async getAccountWithActualTokens(accountId: number): Promise<TwitterAccount> {
    // gets account, checks if tokens are valid, if not, refreshes them
    const account = await this.twitterAccountRepository.findOne(accountId, {
      select: [
        'id',
        'refresh_token',
        'access_token',
        'access_token_expiry',
        'twitter_id',
        'screen_name',
        'user_id',
      ],
    });

    console.log('Account: ', account);
    if (!account) {
      throw new HttpException('Account not found', 404);
    }

    if (!account.refresh_token) {
      throw new HttpException('Refresh token is required', 400);
    }

    if (
      !account.access_token ||
      !account.access_token_expiry ||
      account.access_token_expiry < new Date()
    ) {
      console.log('TwitterAccountService: ', 'Refreshing tokens');
      const tokens = await this.twitterAuthService.getTokensByRefreshToken(
        account.refresh_token,
      );
      account.access_token = tokens.access_token;
      account.refresh_token = tokens.refresh_token;
      account.access_token_expiry = new Date();
      account.access_token_expiry.setHours(
        account.access_token_expiry.getHours() + 2,
      );
      await this.twitterAccountRepository.save(account);
    }
    return account;
  }

  async getFollowing(accountId: number, userId: TUserID) {
    const account = await this.getAccountById(accountId);
    console.log({ account });
    if (!account) {
      throw new HttpException('Account not found', 404);
    }
    // if (account.user_id !== userId) {
    //   throw new HttpException('Access denied', 403);
    // }
    return this.getFollowingByScreenNameWithCache(account.screen_name);
  }

  async getFollowingByScreenName(screen_name: string) {
    const apify_token = this.configService.get('APIFY_TOKEN');
    const response = await axios.post(
      `https://api.apify.com/v2/acts/twittapi~twitter-user-following-scraper/run-sync-get-dataset-items?token=${apify_token}&method=POST`,
      {
        username: screen_name,
        num: 1000,
      },
    );
    return response.data.map((item) => ({
      id: item.id,
      screen_name: item.screen_name,
      is_verified: item.is_blue_verified,
      other_data: item,
    }));
  }

  async getTwitterIdByScreenNameWithCache(
    screen_name: string,
    accessToken: string,
  ) {
    // no expiration for ids
    if (this.twitterIdCache[screen_name]) {
      return this.twitterIdCache[screen_name];
    }
    const response = await fetch(
      `https://api.twitter.com/2/users/by/username/${screen_name}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error fetching user data: ${errorText}`);
    }

    const userData = (await response.json()) as Record<
      string,
      Record<string, string>
    >;
    this.twitterIdCache[screen_name] = userData.data.id;
    return userData.data.id;
  }

  async getTweetsByTwitterIdWithCache(
    twitterId: string,
    account: TwitterAccount,
    since_id?: string,
  ): Promise<TwitterTimelineResponse> {
    console.log(since_id, this.cachedTweets[twitterId]);
    if (
      this.cachedTweets[twitterId] &&
      this.cachedTweets[twitterId].lastCheckedTweetId &&
      since_id &&
      BigInt(this.cachedTweets[twitterId].lastCheckedTweetId) > BigInt(since_id)
    ) {
      return this.cachedTweets[twitterId].tweets as TwitterTimelineResponse;
    }
    // fetch tweets, not timeline
    const options = {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + account.access_token },
    };
    const tweetFields = [
      'conversation_id',
      'referenced_tweets',
      'in_reply_to_user_id',
    ].join(',');
    const userFields = [
      'connection_status',
      'is_identity_verified',
      'verified_type',
      'public_metrics',
    ].join(',');
    const max_results = 100;
    const tweets = (await fetch(
      `https://api.twitter.com/2/users/${twitterId}/tweets?user.fields=${userFields}&tweet.fields=${tweetFields}&max_results=${max_results}${
        since_id ? '&since_id=' + since_id : ''
      }`,
      options,
    )
      .then((response) => response.json())
      .catch((err) => console.error(err))) as TwitterTimelineResponse;

    if (tweets.status === 429) {
      console.log(tweets);
      throw new Error('getTweetsByTwitterIdWithCache> Rate limit exceeded');
    }

    this.cachedTweets[twitterId] = {
      lastCheckedTweetId: tweets.meta.newest_id,
      tweets,
    };

    return tweets as TwitterTimelineResponse;
  }

  public mapTweets(
    timeline: TwitterTimelineResponse,
    extraUser?: Partial<TwitterUser>,
  ): MappedTweet[] {
    if (!timeline.data) {
      return [];
    }

    const includedUsers: TwitterUser[] = timeline.includes?.users ?? [];

    const getAuthor = (authorId?: string): TwitterUser | undefined => {
      return includedUsers.find((u) => u.id && u.id === authorId);
    };

    return timeline.data.map((tweet) => {
      const author = (extraUser as TwitterUser) ?? getAuthor(tweet.author_id);
      console.log({
        author,
      });
      const extended_referenced_tweets = tweet.referenced_tweets?.map((ref) => {
        const refTweet = timeline.data.find((t) => t.id === ref.id);
        const refAuthor = refTweet ? getAuthor(refTweet.author_id) : undefined;
        return {
          ...ref,
          tweet: refTweet ? { ...refTweet, author: refAuthor } : undefined,
        };
      });
      return { ...tweet, author, extended_referenced_tweets };
    });
  }

  public flattenUniqueMappedTweets(
    mappedTweets2D: MappedTweet[][],
  ): MappedTweet[] {
    const flattened: MappedTweet[] = mappedTweets2D.flat();

    const seenIds = new Set<string>();
    const uniqueTweets: MappedTweet[] = flattened.filter((tweet) => {
      if (seenIds.has(tweet.id)) {
        return false;
      }
      seenIds.add(tweet.id);
      return true;
    });

    return uniqueTweets;
  }

  public getMaxTweetId(tweets: MappedTweet[]): string {
    let maxId: string | undefined;

    for (const tweet of tweets) {
      if (tweet && tweet.id) {
        if (maxId === undefined || BigInt(tweet.id) > BigInt(maxId)) {
          maxId = tweet.id;
        }
      }
    }
    return maxId || '';
  }
  public getTweetsByList(
    accounts: string[],
    twitterAccount: TwitterAccount,
    last_checked_tweet_id: string,
  ) {
    return Promise.all(
      accounts.map(async (account) => {
        try {
          const account_id = await this.getTwitterIdByScreenNameWithCache(
            account,
            twitterAccount.access_token,
          );

          const tweets = (await this.getTweetsByScreenNameWithCache(
            account,
            twitterAccount,
            last_checked_tweet_id,
          )) as TwitterTimelineResponse;

          const mappedTweets = this.mapTweets(tweets, {
            username: account,
            id: account_id,
          });

          console.log({
            account,
            account_id,
            mappedTweets: mappedTweets.slice(0, 3),
          });

          return mappedTweets;
        } catch (e) {
          return [];
        }
      }),
    ).then(this.flattenUniqueMappedTweets);
  }

  async getTweetsByScreenNameWithCache(
    screen_name: string,
    account: TwitterAccount,
    since_id?: string,
  ) {
    const twitterId = await this.getTwitterIdByScreenNameWithCache(
      screen_name,
      account.access_token,
    );
    return this.getTweetsByTwitterIdWithCache(twitterId, account, since_id);
  }

  async getFollowingByScreenNameWithCache(screen_name: string) {
    if (
      this.followingCache[screen_name] &&
      this.followingCacheExpiry[screen_name] > new Date()
    ) {
      return this.followingCache[screen_name];
    }
    let following = await this.getFollowingByScreenName(screen_name).catch(
      (e) => {
        console.log(e.message);
        console.log('Following 2nd attempt');
      },
    );
    if (!following) {
      following = await this.getFollowingByScreenName(screen_name);
    }
    this.followingCache[screen_name] = following;
    this.followingCacheExpiry[screen_name] = new Date();
    this.followingCacheExpiry[screen_name].setHours(
      this.followingCacheExpiry[screen_name].getHours() + 1,
    );
    return following;
  }

  async createAccount(
    userId: TUserID,
    createAccount: Partial<TwitterAccount>,
  ): Promise<TwitterAccount> {
    if (!createAccount.refresh_token) {
      throw new HttpException('Refresh token is required', 400);
    }

    if (!createAccount.access_token) {
      console.log('No access token provided, fetching new tokens');
      const tokens = await this.twitterAuthService.getTokensByRefreshToken(
        createAccount.refresh_token,
      );
      createAccount.access_token = tokens.access_token;
      createAccount.refresh_token = tokens.refresh_token;
    }

    const { screen_name, twitter_id } =
      await this.twitterAuthService.getAccountDetailsByAccessToken(
        createAccount.access_token,
      );

    let account = await this.twitterAccountRepository.findOne({
      where: { twitter_id, user_id: userId },
    });

    if (!account) {
      console.log('Creating new account');
      account = new TwitterAccount();
    }

    account.user_id = userId;
    account.refresh_token = createAccount.refresh_token;

    account.screen_name = screen_name;
    account.twitter_id = twitter_id;

    const savedAccount = await this.twitterAccountRepository.save(account);

    console.log('Saved account', savedAccount);

    const saveTokensResult = await this.saveTokens(
      savedAccount.id,
      createAccount.access_token,
      createAccount.refresh_token,
    );

    console.log(
      'Emitting this.twitterAccountEmitter.emitTwitterAccountCreated(savedAccount.id);',
      savedAccount,
      savedAccount.id,
    );
    this.twitterAccountEmitter.emitTwitterAccountCreated(savedAccount.id);

    return saveTokensResult;
  }

  @OnEvent(TWITTER_ACCOUNT_CREATED_EVENT)
  async warmUpCache(accountId: number) {
    const account = await this.getAccountById(accountId);
    if (!account) {
      return;
    }
    await this.getFollowingByScreenNameWithCache(account.screen_name).catch(
      () => log('Failed to warm up cache'),
    );
  }

  async updateAccountWithUserValidation(
    accountId: number,
    userId: TUserID,
    updateAccount: Partial<TwitterAccount>,
  ): Promise<TwitterAccount> {
    const account = await this.twitterAccountRepository.findOne(accountId);

    if (!account) {
      throw new HttpException('Account not found', 404);
    }

    if (account.user_id !== userId) {
      throw new HttpException('Access denied', 403);
    }

    const { refresh_token, access_token } = updateAccount;

    if (!access_token && !refresh_token) {
      throw new HttpException('No data to update', 400);
    }

    if (!access_token && refresh_token) {
      const tokens = await this.twitterAuthService.getTokensByRefreshToken(
        refresh_token,
      );
      updateAccount.access_token = tokens.access_token;
    }

    return this.saveTokens(
      accountId,
      updateAccount.access_token,
      updateAccount.refresh_token,
    );
  }

  async saveTokens(
    accountId: number,
    accessToken: string,
    refreshToken: string,
  ): Promise<TwitterAccount> {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry to one hour from now

    await this.twitterAccountRepository.update(
      { id: accountId },
      {
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expiry: expiryDate,
      },
    );

    return this.twitterAccountRepository.findOne(accountId, {
      select: [
        'twitter_id',
        'screen_name',
        'access_token',
        'refresh_token',
        'id',
        'access_token_expiry',
        'user_id',
      ],
    });
  }

  public async tweet(
    accessToken: string,
    text: string,
    in_reply_to_tweet_id?: string,
  ): Promise<any> {
    try {
      console.log('Tweeting:' + text);
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          text,
          ...(in_reply_to_tweet_id ? { reply: { in_reply_to_tweet_id } } : {}),
        }), // The body must be a JSON object with a `text` property
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error posting tweet: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  public replyToTweet(
    accessToken: string,
    tweetId: string,
    text: string,
  ): Promise<any> {
    return this.tweet(accessToken, text, tweetId);
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

    const expansions = 'author_id';
    const tweetFields = [
      'conversation_id',
      'referenced_tweets',
      'in_reply_to_user_id',
    ].join(',');
    const userFields = [
      'connection_status',
      'is_identity_verified',
      'verified_type',
      'public_metrics',
    ].join(',');
    const max_results = 100;

    const timeline = (await fetch(
      `https://api.x.com/2/users/${
        twitterAccount.twitter_id
      }/timelines/reverse_chronological?user.fields=${userFields}&tweet.fields=${tweetFields}&expansions=${expansions}&max_results=${max_results}${
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

    const expansions = 'author_id';
    const tweetFields = [
      'conversation_id',
      'referenced_tweets',
      'in_reply_to_user_id',
    ].join(',');
    const userFields = [
      'connection_status',
      'is_identity_verified',
      'verified_type',
      'public_metrics',
    ].join(',');

    const mentions = (await fetch(
      `https://api.x.com/2/users/${
        twitterAccount.twitter_id
      }/mentions?user.fields=${userFields}&${tweetFields}&expansions=${expansions}${
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
}
