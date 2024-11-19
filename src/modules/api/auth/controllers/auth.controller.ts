import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService, LoginDTO, RegisterDTO, TokenDTO } from '..';
import { UserService } from '../../user';

@Controller('api/auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @ApiOperation({
    summary:
      'Login via email and password: we have this opportunity, but not using it',
  })
  @ApiResponse({ status: 201, description: 'Successful Login', type: TokenDTO })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() payload: LoginDTO): Promise<TokenDTO> {
    const user = await this.authService.validateUser(payload);
    return await this.authService.createToken(user);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user via login, password and e-mail',
  })
  @ApiResponse({
    status: 201,
    description: 'Successful Registration',
    type: TokenDTO,
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
  @ApiResponse({ status: 201, description: 'Successful Login', type: TokenDTO })
  async mockLogin(@Query('id') id = 1): Promise<any> {
    const user = await this.userService.get(id);
    return await this.authService.createToken(user);
  }
}
