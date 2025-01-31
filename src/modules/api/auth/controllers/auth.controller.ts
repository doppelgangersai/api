import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService, LoginDTO, RegisterDTO, TokenWithUserDTO } from '..';
import { UserService } from '../../user';

@Controller('api/auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({
    summary:
      '[DEPRECARED] Login via email and password: we have this opportunity, but not using it',
  })
  @ApiResponse({
    status: 201,
    description: 'Successful Login',
    type: TokenWithUserDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Post('login')
  async login(@Body() payload: LoginDTO): Promise<TokenWithUserDTO> {
    const user = await this.authService.validateUser(payload);
    return await this.authService.createToken(user);
  }

  @Post('register')
  @ApiOperation({
    summary: '[DEPRECARED] Register a new user via login, password and e-mail',
  })
  @ApiResponse({
    status: 201,
    description: 'Successful Registration',
    type: TokenWithUserDTO,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async register(@Body() payload: RegisterDTO): Promise<any> {
    const user = await this.userService.createSecured(payload);
    return await this.authService.createToken(user);
  }

  // TODO: remove this endpoint in production
  @Get('mock-login')
  @ApiOperation({ summary: 'Mock Login, disabled in production' })
  @ApiQuery({ name: 'id', required: false })
  @ApiResponse({
    status: 200,
    description: 'Successful Login',
    type: TokenWithUserDTO,
  })
  async mockLogin(@Query('id') id = 1): Promise<any> {
    const user = await this.userService.get(id);
    return this.authService.createToken(user);
  }
}
