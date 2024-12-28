import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import fetch from 'node-fetch';
import { ConfigService } from '../../../config';
import { MessagesWithTitle } from '../../../ai/ai.service';
import { ChatbotService } from '../../chatbot/chatbot.service';
import { UserService } from '../../user';
import { VaultEmitter } from '../vault.emitter';
import { OnEvent } from '@nestjs/event-emitter';
import { TWITTER_CONNECTED_EVENT } from '../../../../core/constants';

@Injectable()
export class TwitterAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private scope = 'tweet.read users.read offline.access';

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
    userId: number,
  ): Promise<void> {
    if (state !== this.state) {
      throw new Error('Invalid state');
    }

    const tokenData = await this.exchangeCodeForToken(code, state);
    const twitterUserId = await this.getUserId(tokenData.access_token);

    await this.userService.update(userId, {
      twitterRefreshToken: tokenData.refresh_token,
      twitterUserId,
    });

    console.log('Twitter refresh token saved for user ID', userId);
    this.vaultEmitter.emitTwitterConnected(userId);

    console.log('Twitter connected and chatbot created for user ID', userId);
  }

  @OnEvent(TWITTER_CONNECTED_EVENT)
  public async processUserTwitter(userId: number): Promise<void> {
    const user = await this.userService.get(userId);
    if (!user) {
      console.error('User not found');
      return;
    }

    const { twitterRefreshToken, twitterUserId } = user;
    if (!twitterRefreshToken || !twitterUserId) {
      console.error('Twitter refresh token or user ID missing');
      return;
    }

    try {
      const accessToken = await this.refreshAccessToken(twitterRefreshToken);
      const userData = await this.getUserData(accessToken);
      const tweetsData = await this.getUserTweets(accessToken, twitterUserId);

      const mappedMessages: MessagesWithTitle = {
        title: `Tweets and replies of ${userData.name} (@${userData.username})`,
        messages: tweetsData.map((tweet) => tweet.text),
      };

      await this.chatbotService.createChatbot([mappedMessages], userId);

      console.log(`Chatbot successfully created for user ID ${userId}`);
    } catch (error) {
      console.error('Error processing user Twitter:', error.message);
    }
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const authHeader = this.generateAuthHeader(
      this.clientId,
      this.clientSecret,
    );
    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.clientId,
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
      throw new Error(`Error refreshing token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
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
  ): Promise<any> {
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!tweetsResponse.ok) {
      const errorText = await tweetsResponse.text();
      throw new Error(`Error fetching tweets: ${errorText}`);
    }

    return tweetsResponse.json();
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

  public async mobileAuth(userId: number, twitterRefreshToken: string) {
    await this.userService.update(userId, {
      twitterRefreshToken,
    });
    this.vaultEmitter.emitTwitterConnected(userId);
  }

  private generateAuthHeader(clientId: string, clientSecret: string): string {
    return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  }
}
