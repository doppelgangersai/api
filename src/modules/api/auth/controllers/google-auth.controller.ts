import {
  Controller,
  Get,
  Query,
  Redirect,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../user';
import { AuthService } from '../services';
import axios from 'axios';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '../../../config';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from '../../../../core/constants/environment.constants';
import { PointsService } from '../../../points/points.service';

@ApiTags('google')
@Controller('api/auth/google')
export class GoogleAuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly pointsService: PointsService,
  ) {}

  @ApiOperation({ summary: 'Google Auth: Redirect to Google OAuth' })
  @Get('init')
  @ApiQuery({ name: 'redirect', required: false })
  @Redirect()
  async googleAuth(@Query('redirect') redirect?: string) {
    const googleClientId = this.configService.get(GOOGLE_CLIENT_ID);
    const googleRedirectUrl =
      redirect || this.configService.get(GOOGLE_REDIRECT_URI);
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
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Authorization code received from Google OAuth',
  })
  @ApiQuery({
    name: 'ref',
    required: false,
    description: 'Optional referral code for tracking the origin of signup',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated and created user if needed.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @Get('auth')
  async googleAuthRedirect(
    @Query('code') code: string,
    @Query('ref') ref?: string,
  ) {
    const referrerId = ref ? parseInt(ref, 10) : null;
    try {
      const { data } = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.configService.get(GOOGLE_CLIENT_ID),
        client_secret: this.configService.get(GOOGLE_CLIENT_SECRET),
        redirect_uri: this.configService.get(GOOGLE_REDIRECT_URI),
        grant_type: 'authorization_code',
        code,
      });

      const { data: userInfo } = await axios.get(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${data.access_token}`,
      );

      let user = await this.userService.getByEmail(userInfo.email);
      const newUser = !user;
      if (!user) {
        user = await this.userService.create({
          email: userInfo.email,
          googleAccessToken: data.access_token as string,
          googleId: userInfo.sub,
          fullName: userInfo.name,
          avatar: userInfo.picture,
          referrerId,
        });
      } else {
        await this.userService.update(user.id, {
          googleAccessToken: data.access_token as string,
        });
      }

      const jwt = this.authService.createToken(user);

      if (!user.referrerId && ref) {
        await this.pointsService.reward(referrerId, 20, 'Referral signup');
        await this.userService.update(user.id, {
          referrerId,
        });
        await this.userService.addFriend(user.id, referrerId);
      }
      return {
        accessToken: jwt.accessToken,
        expiresIn: jwt.expiresIn,
        user: jwt.user,
        googleUserInfo: userInfo,
        redirectTo: '/dashboard/vault',
        newUser,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
