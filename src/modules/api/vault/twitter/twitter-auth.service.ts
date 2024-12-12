import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import fetch from 'node-fetch';
import { ConfigService } from '../../../config';
import { MessagesWithTitle } from '../../../ai/ai.service';
import { ChatbotService } from '../../chatbot/chatbot.service';

const m: MessagesWithTitle = {
  title: 'title',
  messages: ['message1', 'message2'],
};

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
  ) {
    this.clientId = this.configService.get<string>('TWITTER_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('TWITTER_CLIENT_SECRET');
    this.redirectUri = this.configService.get<string>('TWITTER_CALLBACK_URL');
  }

  generateAuthData(): void {
    this.state = randomBytes(16).toString('base64url');
    this.codeVerifier = randomBytes(32).toString('base64url');
  }

  getAuthorizationUrl(): string {
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

  async exchangeCodeForToken(code: string, returnedState: string) {
    if (!code || returnedState !== this.state) {
      throw new Error('Invalid state or no code returned');
    }

    const authHeader = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');

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

  async getUserId(accessToken: string): Promise<string> {
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

  async getUserTweets(accessToken: string, userId: string): Promise<any> {
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return tweetsResponse.json();
  }
}
