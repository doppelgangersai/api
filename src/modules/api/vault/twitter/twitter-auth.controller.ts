import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
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
import { ChatbotService } from '../../chatbot/chatbot.service';
import { OptionalAuthGuard } from '../../../../core/guards/optional-auth.guard';
import { AuthGuard } from '@nestjs/passport';

class TweetDto {
  @ApiProperty({ example: 'This is a tweet' })
  text: string;
}

class TweetsDataDto {
  @ApiProperty({ type: [TweetDto] })
  data: TweetDto[];
}

class TwitterMobileAuthDto {
  @ApiProperty({
    example:
      'S0ME-REFRESH-TOKEN-qYXczV1hjYVhFZGlWMUw5b3ZGOXNBSlFUVHVxWUdJOjE3MzUzODQzNjA1NTI6MToxOnJ0OjE',
  })
  twitterRefreshToken: string;
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
      'Handle Twitter authentication callback: pass URL from Twitter redirection here',
  })
  @ApiBearerAuth()
  @UseGuards(OptionalAuthGuard)
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
      'Successfully authenticated and retrieved Twitter refresh token',
  })
  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') returnedState: string,
    @Res() res: Response,
    @CurrentUser() user: User,
  ) {
    try {
      await this.twitterAuthService.saveTwitterRefreshToken(
        code,
        returnedState,
        user.id || 1,
      );
      res.status(200).json({ message: 'Twitter connected successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // should receive twitterRefreshToken
  @Patch('mobile')
  @UseGuards(AuthGuard('jwt'))
  async authMobile(
    @Body() { twitterRefreshToken }: TwitterMobileAuthDto,
    @CurrentUser() user: User,
  ) {
    await this.twitterAuthService.mobileAuth(user.id, twitterRefreshToken);
  }
}
