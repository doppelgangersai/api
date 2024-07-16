import {
  Controller,
  Get,
  Query,
  Redirect,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from 'modules/config';
import { UserService } from '../../user';
import { AuthService } from '../services';
import axios from 'axios';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('google')
@Controller('api/auth/google')
export class GoogleAuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Google Auth: Redirect to Google OAuth' })
  @Get('init')
  @ApiQuery({ name: 'redirect', required: false })
  @Redirect()
  async googleAuth(@Query('redirect') redirect?: string) {
    const googleClientId = this.configService.get('GOOGLE_CLIENT_ID');
    const googleRedirectUrl =
      redirect || this.configService.get('GOOGLE_REDIRECT_URI');
    const scopes = encodeURIComponent('email profile');

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      googleClientId,
    )}&redirect_uri=${encodeURIComponent(
      googleRedirectUrl,
    )}&response_type=code&scope=${scopes}`;
    console.log(url);
    return {
      url,
    };
  }

  @ApiOperation({
    summary: 'Google Auth: Create or authenticate user with Google OAuth',
  })
  @Get('auth')
  async googleAuthRedirect(@Query('code') code: string) {
    try {
      const { data } = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.configService.get('GOOGLE_CLIENT_ID'),
        client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
        redirect_uri: this.configService.get('GOOGLE_REDIRECT_URI'),
        grant_type: 'authorization_code',
        code,
      });

      const { data: userInfo } = await axios.get(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${data.access_token}`,
      );
      let user = await this.userService.getByEmail(userInfo.email);
      if (!user) {
        user = await this.userService.create({
          email: userInfo.email,
          googleAccessToken: data.access_token as string,
          googleId: userInfo.sub,
          fullName: userInfo.name,
          avatar: userInfo.picture,
        });
      } else {
        await this.userService.update(user.id, {
          googleAccessToken: data.access_token as string,
        });
      }

      const jwt = await this.authService.createToken(user);
      return {
        accessToken: jwt.accessToken,
        expiresIn: jwt.expiresIn,
        user: jwt.user,
        googleUserInfo: userInfo,
        redirectTo: '/dashboard/vault',
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
