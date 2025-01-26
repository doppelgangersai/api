import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { TokenDTO } from '../auth.dtos';

export class AppleMobileAuthDto {
  @ApiProperty({
    description: 'Apple ID Token',
    example: 'eyJraWQiOiJXZWJHUX...-z9g&state=state',
  })
  idToken: string;
}
@Controller('api/auth/apple')
export class AppleAuthController {
  constructor() {}

  @ApiOperation({
    summary: '[mock] Apple Auth: Authenticate user with Apple ID',
  })
  @ApiResponse({
    status: 201,
    description: 'Successful Login',
    type: TokenDTO,
  })
  @HttpCode(201)
  @Post('mobile')
  async mobileAuth(@Body() body: AppleMobileAuthDto): Promise<TokenDTO> {
    return {
      accessToken: 'accessToken',
      expiresIn: 'expiresIn',
    };
  }
}
