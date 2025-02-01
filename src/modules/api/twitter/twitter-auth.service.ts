import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '../../config';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable()
export class TwitterAuthService {
  private readonly tokenUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.tokenUrl = 'https://api.twitter.com/2/oauth2/token';
    this.clientId = this.configService.get<string>('TWITTER_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('TWITTER_CLIENT_SECRET');
  }

  async getTokensByRefreshToken(refresh_token: string): Promise<TokenResponse> {
    console.log({ refresh_token });
    console.log(this.clientId, this.clientSecret);
    const authHeader = this.generateAuthHeader(
      this.clientId,
      this.clientSecret,
    );

    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
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
      throw new UnauthorizedException(
        `Error fetching tokens: ${JSON.stringify(errorText)}`,
      );
    }

    const responseData = (await tokenResponse.json()) as TokenResponse;
    return {
      access_token: responseData.access_token,
      refresh_token: responseData.refresh_token,
      expires_in: responseData.expires_in,
      token_type: responseData.token_type,
    };
  }

  public async getAccountDetailsByAccessToken(
    access_token: string,
  ): Promise<{ screen_name: string; twitter_id: string }> {
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${access_token}` },
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
      screen_name: userData.data.username,
      twitter_id: userData.data.id,
    };
  }

  private generateAuthHeader(clientId: string, clientSecret: string): string {
    return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  }
}
