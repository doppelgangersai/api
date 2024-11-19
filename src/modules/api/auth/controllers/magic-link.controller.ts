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
import {
  ApiOperation,
  ApiResponse,
  ApiResponseProperty,
  ApiTags,
} from '@nestjs/swagger';
import { PointsService } from '../../../points/points.service';
import { UserService } from '../../user';
import { TokenDTO } from '../auth.dtos';

class SendMagicLinkResponse {
  @ApiResponseProperty({
    example: 'gr33t1ngFr0mTa1',
  })
  token: string;
}

@ApiTags('authentication')
@Controller('api/auth/email')
export class MagicLinkAuthController {
  constructor(
    private readonly magicLinkService: MagicLinkService,
    private readonly pointsService: PointsService,
    private readonly userService: UserService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'Magic link sent successfully',
    type: SendMagicLinkResponse,
  })
  @ApiOperation({ summary: 'Send magic link with code to email' })
  @Post('send')
  async sendMagicLink(
    @Body() { email }: MagicLinkSendDTO,
    @Res() res: Response,
  ) {
    try {
      const code = this.magicLinkService.generateCode();
      const token = this.magicLinkService.generateToken({ email, code });
      await this.magicLinkService.sendEmail({ email, token, code });
      res
        .status(HttpStatus.OK)
        .json({ message: 'Magic link sent successfully.', token });
    } catch (error) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  @ApiResponse({ status: 201, description: 'Successful Login', type: TokenDTO })
  @ApiResponse({ status: 401, description: 'Invalid token / code' })
  @ApiOperation({
    summary:
      'Verify magic link with code: post `token` from `send` and code from e-mail',
  })
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

  // TODO: remove
  @ApiOperation({ summary: 'Demo endpoint for testing purposes' })
  @Get('demo')
  demo(@Query('token') token: string) {
    return {
      emailToken: token,
      description: 'This is a demo endpoint for testing purposes',
    };
  }
}
