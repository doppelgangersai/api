import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';
import { TelegramService } from './telegram.service';
import * as process from 'node:process';
import { configDotenv } from 'dotenv';
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

@ApiTags('Telegram')
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
  async authInit(
    @Body() dto: TelegramAuthInitDTO,
  ): Promise<{ phoneCodeHash: string }> {
    return this.telegramService.sendAuthCode(dto.phone);
  }

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
  async authComplete(@Body() dto: TelegramAuthCompleteDTO): Promise<string> {
    return this.telegramService.completeAuth(
      dto.code,
      dto.phone,
      dto.phoneCodeHash,
      dto.password,
    );
  }
}
