// Context: part of methods will be migrated to TwitterAuthService in vault-twitter-auth.service.ts in twitter module
import { randomBytes } from 'crypto';
import fetch from 'node-fetch';
import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';

import { ConfigService } from '../../../config';
import { MessagesWithTitle } from '../../../ai/ai.service';
import { ChatbotService } from '../../chatbot/chatbot.service';
import { ConnectionStatus, UserService } from '../../user';
import { VaultEmitter } from '../vault.emitter';
import { TWITTER_CONNECTED_EVENT } from '../../../../core/constants';
import { TUserID } from '../../user/user.types';
import { ChatbotSource } from '../../chatbot/chatbot.types';
import { TwitterAccountService } from '../../twitter/twitter-account.service';

@Injectable()
export class VaultTwitterAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private scope = 'tweet.read tweet.write users.read offline.access';

  private state: string;
  private codeVerifier: string;

  private baseAuthorizeUrl = 'https://twitter.com/i/oauth2/authorize';
  private tokenUrl = 'https://api.twitter.com/2/oauth2/token';

  constructor(
    private readonly configService: ConfigService,
    private readonly chatbotService: ChatbotService,
    private readonly userService: UserService,
    private readonly vaultEmitter: VaultEmitter,
    private readonly twitterAccountService: TwitterAccountService,
  ) {
    this.clientId = this.configService.get<string>('TWITTER_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('TWITTER_CLIENT_SECRET');
    this.redirectUri = this.configService.get<string>('TWITTER_CALLBACK_URL');
  }

  public generateAuthData(): void {
    this.state = randomBytes(16).toString('base64url');
    this.codeVerifier = randomBytes(32).toString('base64url');
  }

  public getAuthorizationUrl(callback?: string): string {
    const codeChallenge = this.codeVerifier;
    const codeChallengeMethod = 'plain';

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: callback || this.redirectUri,
      scope: this.scope,
      state: this.state,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod,
    });

    return `${this.baseAuthorizeUrl}?${params.toString()}`;
  }

  public async saveTwitterRefreshToken(
    code: string,
    state: string,
    userId: TUserID,
  ): Promise<void> {
    const tokenData = (await this.exchangeCodeForToken(code, state)) as Record<
      string,
      string
    >;

    const account = await this.twitterAccountService.createAccount(userId, {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
    });

    await this.userService.update(userId, {
      twitterRefreshToken: account.refresh_token,
      twitterUserId: account.twitter_id,
      twitterAccountId: account.id,
      twitterConnectionStatus: ConnectionStatus.CONNECTED,
    });

    this.vaultEmitter.emitTwitterConnected(userId);
  }

  @OnEvent(TWITTER_CONNECTED_EVENT)
  public async processUserTwitter(userId: TUserID): Promise<void> {
    const user = await this.userService.get(userId);
    if (!user) {
      console.error('User not found');
      return;
    }

    if (!user.twitterAccountId) {
      console.error('Twitter account not found in User');
      return;
    }

    const account = await this.twitterAccountService.getAccountWithActualTokens(
      user.twitterAccountId,
    );

    if (!account) {
      console.error('Twitter account not found');
      return;
    }

    const { access_token: accessToken } = account;

    try {
      if (!user.twitterUserId && account.twitter_id) {
        await this.userService.update(userId, {
          twitterUserId: account.twitter_id,
        });
      }
      const userData = await this.getUserData(accessToken);
      const tweetsData = await this.getUserTweets(
        accessToken,
        account.twitter_id,
      );

      const mappedMessages: MessagesWithTitle = {
        title: `Tweets and replies of ${userData.name} (@${userData.username})`,
        messages: tweetsData.map((tweet) => tweet.text),
      };

      await this.chatbotService.createOrUpdateChatbotWithSameSource(
        [mappedMessages],
        userId,
        ChatbotSource.TWITTER,
        account.id,
      );
      await this.userService.update(userId, {
        twitterConnectionStatus: ConnectionStatus.PROCESSED,
      });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('Error processing user Twitter:', error.message);
    }
  }

  public async refreshAccessToken(refreshToken: string): Promise<string> {
    const authHeader = this.generateAuthHeader(
      this.clientId,
      this.clientSecret,
    );

    const tokensParamsObj = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
    };
    const tokenParams = new URLSearchParams(tokensParamsObj);

    const tokenResponse = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Error refreshing token: ${errorText}`);
    }

    const tokenData = (await tokenResponse.json()) as Record<string, string>;
    const { access_token, refresh_token } = tokenData;

    await this.userService.update(1, { twitterRefreshToken: refresh_token });

    return access_token;
  }

  private async getUserData(
    accessToken: string,
  ): Promise<{ name: string; username: string }> {
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`Error fetching user data: ${errorText}`);
    }

    const userData = (await userResponse.json()) as Record<
      string,
      Record<string, string>
    >;
    return {
      name: userData.data.name,
      username: userData.data.username,
    };
  }

  public async getUserId(accessToken: string): Promise<string> {
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`Error fetching user data: ${errorText}`);
    }

    const userData = (await userResponse.json()) as Record<
      string,
      Record<string, string>
    >;
    return userData.data.id;
  }

  public async getUserTweets(
    accessToken: string,
    userId: string,
    maxTweets = 500,
  ): Promise<Record<string, string>[]> {
    const allTweets = [];
    let nextToken: string | undefined;

    // let requests_count = 0;
    while (allTweets.length < maxTweets) {
      const remaining = maxTweets - allTweets.length;
      const fetchCount = remaining > 100 ? 100 : remaining;

      const url = new URL(`https://api.twitter.com/2/users/${userId}/tweets`);
      url.searchParams.set('max_results', fetchCount.toString());
      if (nextToken) {
        url.searchParams.set('pagination_token', nextToken);
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        break;
      }

      // requests_count++;
      const data = (await response.json()) as Record<
        string,
        Record<string, string>
      > & {
        data: string[];
      };
      if (data.data) {
        allTweets.push(...data.data);
      }

      if (data.meta?.next_token) {
        nextToken = data.meta.next_token;
      } else {
        break;
      }
    }

    return allTweets;
  }
  public async exchangeCodeForToken(
    code: string,
    returnedState: string,
  ): Promise<any> {
    console.log({ code, returnedState, state: this.state });
    if (!code || returnedState !== this.state) {
      throw new Error('Invalid state or no code returned');
    }

    const authHeader = this.generateAuthHeader(
      this.clientId,
      this.clientSecret,
    );

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      code_verifier: this.codeVerifier,
    });

    const tokenResponse = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Error fetching token: ${errorText}`);
    }

    return tokenResponse.json();
  }

  public async tweet(accessToken: string, text: string): Promise<any> {
    try {
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text }), // The body must be a JSON object with a `text` property
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

  public async mobileAuth(
    userId: TUserID,
    twitterRefreshToken: string,
    twitterAccessToken: string,
  ): Promise<void> {
    const account = await this.twitterAccountService.createAccount(userId, {
      access_token: twitterAccessToken,
      refresh_token: twitterRefreshToken,
    });
    await this.userService.update(userId, {
      twitterRefreshToken: account.refresh_token,
      twitterAccountId: account.id,
      twitterConnectionStatus: ConnectionStatus.CONNECTED,
    });
    this.vaultEmitter.emitTwitterConnected(userId);
  }

  private generateAuthHeader(clientId: string, clientSecret: string): string {
    return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  }
}
