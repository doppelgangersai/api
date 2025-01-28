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
import { VaultTwitterAuthService } from './vault-twitter-auth.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiProperty,
  ApiParam,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { User } from '../../user';
import { OptionalAuthGuard } from '../../../../core/guards/optional-auth.guard';
import { AuthGuard } from '@nestjs/passport';

class TwitterMobileAuthDto {
  @ApiProperty({
    example:
      'S0ME-REFRESH-TOKEN-qYXczV1hjYVhFZGlWMUw5b3ZGOXNBSlFUVHVxWUdJOjE3MzUzODQzNjA1NTI6MToxOnJ0OjE',
  })
  twitterRefreshToken: string;
  @ApiProperty({
    example:
      'SOmE-ACCESSTOKEN-1qYXczV1hjYVhFZGlWMUw5b3ZGOXNBSlFUVHVxWUdJOjE3MzUzODQzNjA1NTI6MToxOnJ0OjE',
    required: false,
  })
  twitterAccessToken?: string;
}

@ApiTags('vault/twitter')
@Controller('api/vault/twitter')
export class VaultTwitterAuthController {
  constructor(
    private readonly vaultTwitterAuthService: VaultTwitterAuthService,
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
  @ApiParam({
    name: 'callback_url',
    required: false,
    description: 'Optional callback URL',
    example: 'https://app.doppelgangers.ai/api/vault/twitter/callback',
  })
  initiateAuth(@Res() res: Response, @Query('callback_url') callback: string) {
    this.vaultTwitterAuthService.generateAuthData();
    const authorizationUrl =
      this.vaultTwitterAuthService.getAuthorizationUrl(callback);
    res.redirect(authorizationUrl);
  }

  @ApiOperation({
    summary:
      'Returns redirect URL for Twitter authentication, with optional param "callback"',
  })
  @ApiResponse({
    status: 200,
    description: 'Twitter authorization URL',
  })
  @Get('auth-url')
  @ApiParam({
    name: 'callback_url',
    required: false,
    description: 'Optional callback URL',
  })
  getAuthUrl(@Query('callback_url') callback: string): {
    redirect_url: string;
  } {
    this.vaultTwitterAuthService.generateAuthData();
    const authorizationUrl =
      this.vaultTwitterAuthService.getAuthorizationUrl(callback);
    return {
      redirect_url: authorizationUrl,
    };
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
      await this.vaultTwitterAuthService.saveTwitterRefreshToken(
        code,
        returnedState,
        user.id || 1,
      );
      res.status(200).json({ message: 'Twitter connected successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    description: 'Saves twitter refreshToken and triggers processing',
  })
  @Patch('mobile')
  async authMobile(
    @Body() { twitterRefreshToken, twitterAccessToken }: TwitterMobileAuthDto,
    @CurrentUser() user: User,
  ) {
    await this.vaultTwitterAuthService.mobileAuth(
      user.id,
      twitterRefreshToken,
      twitterAccessToken,
    );
  }
}
