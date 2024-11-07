import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  UnauthorizedException,
  Get,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { MagicLinkService } from '../services/';
import {
  MagicLinkSendDTO,
  MagicLinkVerifyDTO,
} from '../services/magic-link/magic-link.dtos';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PointsService } from '../../../points/points.service';
import { UserService } from '../../user';

@ApiTags('authentication')
@Controller('api/auth/email')
export class MagicLinkAuthController {
  constructor(
    private readonly magicLinkService: MagicLinkService,
    private readonly pointsService: PointsService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Send magic link with code to email' })
  @Post('send')
  async sendMagicLink(
    @Body() { email }: MagicLinkSendDTO,
    @Res() res: Response,
  ) {
    try {
      const code = await this.magicLinkService.generateCode();
      const token = await this.magicLinkService.generateToken({ email, code });
      await this.magicLinkService.sendEmail({ email, token, code });
      res
        .status(HttpStatus.OK)
        .json({ message: 'Magic link sent successfully.' });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  @ApiOperation({ summary: 'Verify magic link with code' })
  @Post('code')
  async verifyCode(@Body() { code, token, ref }: MagicLinkVerifyDTO) {
    const referrerId = ref ? parseInt(ref, 10) : null;
    return this.magicLinkService
      .authenticate({ code, token })
      .then(async (authResponse) => {
        const { user } = authResponse;
        if (referrerId && !user.referrerId) {
          user.referrerId = referrerId;
          await this.pointsService.reward(referrerId, 20, 'Referral');
          await this.userService.update(user.id, {
            referrerId,
          });
          await this.userService.addFriend(user.id, referrerId);
        }
        return {
          ...authResponse,
          user,
        };
      })
      .catch((error: Error) => {
        throw new UnauthorizedException(error.message);
      });
  }

  @ApiOperation({ summary: 'Demo endpoint for testing purposes' })
  @Get('demo')
  demo(@Query('token') token: string) {
    return {
      emailToken: token,
      description: 'This is a demo endpoint for testing purposes',
    };
  }
}
