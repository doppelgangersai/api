import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { TokenDTO, TokenWithUserDTO } from '../auth.dtos';
import { AppleAuthService } from '../services/apple-auth.service';

export class AppleMobileAuthDto {
  @ApiProperty({
    description: 'Apple ID Token',
    example: 'eyJraWQiOiJXZWJHUX...-z9g&state=state',
  })
  idToken: string;
}
@Controller('api/auth/apple')
export class AppleAuthController {
  constructor(private readonly appleAuthService: AppleAuthService) {}

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
  mobileAuth(@Body() body: AppleMobileAuthDto): Promise<TokenWithUserDTO> {
    return this.appleAuthService.authByIdToken(body.idToken);
  }
}
