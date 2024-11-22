import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TelegramService } from './telegram.service';
import * as process from 'node:process';
import { configDotenv } from 'dotenv';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { User } from '../../user';
configDotenv();

export class TelegramAuthInitDTO {
  @ApiProperty({
    description: 'Phone number to send the auth code to',
    example: process.env.PHONE_EXAMPLE ?? '+1234567890',
  })
  phone: string;
}

export class TelegramAuthCompleteDTO {
  @ApiProperty({ description: 'Received auth code', example: '12345' })
  code: string;
  @ApiProperty({
    description: 'Password',
    example: process.env.PASSWORD_EXAMPLE,
  })
  password?: string;
  @ApiProperty({
    description: 'Phone number',
    example: process.env.PHONE_EXAMPLE ?? '+1234567890',
  })
  phone: string;
  @ApiProperty({ description: 'Phone code hash', example: '12345' })
  phoneCodeHash: string;
}

@ApiBearerAuth()
@ApiTags('telegram')
@Controller('api/vault/telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('init')
  @ApiOperation({ summary: 'Initialize Telegram Authentication' })
  @ApiBody({
    type: TelegramAuthInitDTO,
    description: 'Phone number for Telegram authentication',
  })
  @ApiResponse({ status: 201, description: 'Auth code sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @UseGuards(AuthGuard())
  async authInit(
    @Body() dto: TelegramAuthInitDTO,
  ): Promise<{ phoneCodeHash: string }> {
    return this.telegramService.sendAuthCode(dto.phone);
  }

  @ApiBearerAuth()
  @Post('complete')
  @ApiOperation({ summary: 'Complete Telegram Authentication' })
  @ApiBody({
    type: TelegramAuthCompleteDTO,
    description: 'Complete authentication using code and password',
  })
  @ApiResponse({
    status: 201,
    description:
      'Authentication completed successfully, returns session string',
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @UseGuards(AuthGuard())
  async authComplete(
    @Body() dto: TelegramAuthCompleteDTO,
    @CurrentUser() user: User,
  ): Promise<string> {
    return this.telegramService.completeAuth(
      // @ts-ignore
      user.id as number,
      dto.code,
      dto.phone,
      dto.phoneCodeHash,
      dto.password,
    );
  }

  // TODO: remove this endpoint in production?
  @ApiBearerAuth()
  @Post('trigger')
  @ApiOperation({ summary: 'Trigger Telegram parser: for dev purpose only' })
  @UseGuards(AuthGuard())
  async trigger(@CurrentUser() user: User) {
    return this.telegramService.parseChats(user.id);
  }
}
