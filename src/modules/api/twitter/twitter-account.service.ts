import { HttpException, Injectable } from '@nestjs/common';
import { TwitterAccount } from './twitter-account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TUserID } from '../user/user.types';
import { TwitterAuthService } from './twitter-auth.service';
import axios from 'axios';
import { ConfigService } from '../../config';
import fetch from 'node-fetch';

@Injectable()
export class TwitterAccountService {
  constructor(
    @InjectRepository(TwitterAccount)
    private readonly twitterAccountRepository: Repository<TwitterAccount>,
    private readonly twitterAuthService: TwitterAuthService,
    private readonly configService: ConfigService,
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
    if (!account) {
      throw new HttpException('Account not found', 404);
    }

    if (!account.refresh_token) {
      throw new HttpException('Refresh token is required', 400);
    }

    console.log('Account', account);

    console.log('Access token:', account.access_token);
    console.log('Access token expiry:', account.access_token_expiry);
    console.log('Current date:', new Date());

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
      console.log('New access token:', account.access_token);
      console.log('New refresh token:', account.refresh_token);
      console.log('New access token expiry:', account.access_token_expiry);
      await this.twitterAccountRepository.save(account);
    }
    return account;
  }

  async getFollowing(accountId: number, userId: TUserID) {
    const account = await this.getAccountWithActualTokens(accountId);
    console.log({ account });
    if (!account) {
      throw new HttpException('Account not found', 404);
    }
    if (account.user_id !== userId) {
      throw new HttpException('Access denied', 403);
    }
    return this.getFollowingByScreenName(account.screen_name);
  }

  async getFollowingByScreenName(screen_name: string) {
    const apify_token = this.configService.get('APIFY_TOKEN');
    const response = await axios.post(
      `https://api.apify.com/v2/acts/apnow~twitter-user-following-scraper/run-sync-get-dataset-items?token=${apify_token}&method=POST`,
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

  async createAccount(
    userId: TUserID,
    createAccount: Partial<TwitterAccount>,
  ): Promise<TwitterAccount> {
    if (!createAccount.refresh_token) {
      throw new HttpException('Refresh token is required', 400);
    }

    const account = new TwitterAccount();
    account.user_id = userId;
    account.refresh_token = createAccount.refresh_token;

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

    account.screen_name = screen_name;
    account.twitter_id = twitter_id;

    const savedAccount = await this.twitterAccountRepository.save(account);

    console.log('Saved account', savedAccount);

    const saveTokensResult = await this.saveTokens(
      savedAccount.id,
      createAccount.access_token,
      createAccount.refresh_token,
    );

    console.log('Saved tokens', saveTokensResult);

    return saveTokensResult;
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
}
