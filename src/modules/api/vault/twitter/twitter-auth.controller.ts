import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { TwitterAuthService } from './twitter-auth.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiProperty,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { User, UserService } from '../../user';
import { MessagesWithTitle } from '../../../ai/ai.service';
import { ChatbotService } from '../../chatbot/chatbot.service';
import { OptionalJwtAuthGuard } from '../../../../core/guards/optional-auth.guard';

class TweetDto {
  @ApiProperty({ example: 'This is a tweet' })
  text: string;
}

class TweetsDataDto {
  @ApiProperty({ type: [TweetDto] })
  data: TweetDto[];
}

class TwitterCallbackResponseDto {
  @ApiProperty({ example: 'string' })
  access_token: string;

  @ApiProperty({ example: 'string or null' })
  refresh_token: string | null;

  @ApiProperty({ example: 'read_write' })
  scope: string;

  @ApiProperty({ example: 3600 })
  expires_in: number;

  @ApiProperty({ example: '123456789' })
  user_id: string;

  @ApiProperty({ type: TweetsDataDto })
  tweets: TweetsDataDto;
}

@ApiTags('Twitter')
@Controller('api/vault/twitter')
export class TwitterAuthController {
  constructor(
    private readonly twitterAuthService: TwitterAuthService,
    private readonly chatbotService: ChatbotService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Initiate Twitter authentication process' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Twitter authorization URL: send user there',
    schema: {
      example: {
        redirect_url:
          'https://twitter.com/oauth/authorize?client_id=xyz&state=abc',
      },
    },
  })
  @Get('init')
  initiateAuth(@Res() res: Response) {
    this.twitterAuthService.generateAuthData();
    const authorizationUrl = this.twitterAuthService.getAuthorizationUrl();
    res.redirect(authorizationUrl);
  }

  @ApiOperation({
    summary:
      'Handle Twitter authentication callback: pass url from twitter redirection there',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiQuery({
    name: 'code',
    type: String,
    required: true,
    description: 'Authorization code returned by Twitter',
  })
  @ApiQuery({
    name: 'state',
    type: String,
    required: true,
    description: 'State parameter to verify the request',
  })
  @ApiResponse({
    status: 200,
    description:
      'Successfully authenticated and retrieved twitter refresh token',
  })
  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') returnedState: string,
    @Res() res: Response,
    @CurrentUser() user: User,
  ) {
    try {
      const tokenData = (await this.twitterAuthService.exchangeCodeForToken(
        code,
        returnedState,
      )) as Record<string, string>;
      const accessToken = tokenData.access_token;
      const twitterUserId = await this.twitterAuthService.getUserId(
        accessToken,
      );
      const tweetsData = (await this.twitterAuthService.getUserTweets(
        accessToken,
        twitterUserId,
      )) as Record<string, any>;

      const tweetsDataDto: TweetsDataDto = {
        data: tweetsData.data.map((tweet) => ({
          text: tweet.text,
        })),
      };

      const mappedMessages: MessagesWithTitle = {
        title: 'Tweets',
        messages: tweetsData.data.map((tweet) => tweet.text),
      };

      await this.chatbotService.createChatbot([mappedMessages], user.id || 1);

      // Update the user with the refresh token
      if (tokenData.refresh_token) {
        await this.userService.update(user.id, {
          twitterRefreshToken: tokenData.refresh_token,
          twitterUserId,
        });
      }

      const responseData: TwitterCallbackResponseDto = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        scope: tokenData.scope,
        expires_in: Number(tokenData.expires_in),
        user_id: twitterUserId,
        tweets: tweetsDataDto,
      };

      res.json(responseData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
