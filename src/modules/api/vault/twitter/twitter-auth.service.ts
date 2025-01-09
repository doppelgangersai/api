import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import fetch from 'node-fetch';
import { ConfigService } from '../../../config';
import { MessagesWithTitle } from '../../../ai/ai.service';
import { ChatbotService } from '../../chatbot/chatbot.service';
import { ConnectionStatus, UserService } from '../../user';
import { VaultEmitter } from '../vault.emitter';
import { OnEvent } from '@nestjs/event-emitter';
import { TWITTER_CONNECTED_EVENT } from '../../../../core/constants';
import { TUserID } from '../../user/user.types';

@Injectable()
export class TwitterAuthService {
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
  ) {
    this.clientId = this.configService.get<string>('TWITTER_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('TWITTER_CLIENT_SECRET');
    this.redirectUri = this.configService.get<string>('TWITTER_CALLBACK_URL');
  }

  public generateAuthData(): void {
    this.state = randomBytes(16).toString('base64url');
    this.codeVerifier = randomBytes(32).toString('base64url');
  }

  public getAuthorizationUrl(): string {
    const codeChallenge = this.codeVerifier;
    const codeChallengeMethod = 'plain';

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
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
    if (state !== this.state) {
      throw new Error('Invalid state');
    }

    const tokenData = await this.exchangeCodeForToken(code, state);
    const twitterUserId = await this.getUserId(tokenData.access_token);

    await this.userService.update(userId, {
      twitterRefreshToken: tokenData.refresh_token,
      twitterUserId,
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

    const { twitterRefreshToken } = user;

    let { twitterUserId } = user;
    if (!twitterRefreshToken) {
      console.error('Twitter refresh token missing');
      return;
    }

    try {
      const accessToken = await this.refreshAccessToken(twitterRefreshToken);

      if (!twitterUserId) {
        twitterUserId = await this.getUserId(accessToken);
        await this.userService.update(userId, {
          twitterUserId,
        });
      }

      const userData = await this.getUserData(accessToken);
      const tweetsData = await this.getUserTweets(accessToken, twitterUserId);

      const mappedMessages: MessagesWithTitle = {
        title: `Tweets and replies of ${userData.name} (@${userData.username})`,
        messages: tweetsData.map((tweet) => tweet.text),
      };

      await this.chatbotService.createChatbot([mappedMessages], userId);
      await this.userService.update(userId, {
        twitterConnectionStatus: ConnectionStatus.PROCESSED,
      });
    } catch (error) {
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

    const tokenData = await tokenResponse.json();
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

    const userData = await userResponse.json();
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

    const userData = await userResponse.json();
    return userData.data.id;
  }

  public async getUserTweets(
    accessToken: string,
    userId: string,
    maxTweets = 500,
  ): Promise<any[]> {
    const allTweets: any[] = [];
    let nextToken: string | undefined = undefined;

    let requests_count = 0;
    // Keep fetching while we haven't reached maxTweets and Twitter has more data
    while (allTweets.length < maxTweets) {
      // Calculate how many tweets we still need
      const remaining = maxTweets - allTweets.length;
      // Twitter allows a max of 100 per request
      const fetchCount = remaining > 100 ? 100 : remaining;

      // Construct URL with query params
      const url = new URL(`https://api.twitter.com/2/users/${userId}/tweets`);
      url.searchParams.set('max_results', fetchCount.toString());
      if (nextToken) {
        url.searchParams.set('pagination_token', nextToken);
      }

      // Make API request
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        break;
      }

      requests_count++;
      const data = await response.json();
      if (data.data) {
        allTweets.push(...data.data);
      }

      // Check for next_token to see if we can continue paginating
      if (data.meta?.next_token) {
        nextToken = data.meta.next_token;
      } else {
        // No more pages to fetch
        break;
      }
    }

    return allTweets;
  }
  public async exchangeCodeForToken(
    code: string,
    returnedState: string,
  ): Promise<any> {
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

    const tokenData = await tokenResponse.json();
    return tokenData;
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

      const result = await response.json();
      // The response will typically include the Tweet data, like tweet ID, text, etc.
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async mobileAuth(userId: TUserID, twitterRefreshToken: string) {
    await this.userService.update(userId, {
      twitterRefreshToken,
    });
    this.vaultEmitter.emitTwitterConnected(userId);
  }

  private generateAuthHeader(clientId: string, clientSecret: string): string {
    return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  }
}
