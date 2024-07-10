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

@ApiTags('authentication')
@Controller('api/auth/email')
export class MagicLinkAuthController {
  constructor(private readonly magicLinkService: MagicLinkService) {}

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
  async verifyCode(@Body() { code, token }: MagicLinkVerifyDTO) {
    return this.magicLinkService
      .authenticate({ code, token })
      .catch((error) => {
        throw new UnauthorizedException(error.message);
      });
  }

  @ApiOperation({ summary: 'Demo endpoint for testing purposes' })
  @Get('demo')
  async demo(@Query() { token }) {
    return {
      emailToken: token,
      description: 'This is a demo endpoint for testing purposes',
    };
  }
}
