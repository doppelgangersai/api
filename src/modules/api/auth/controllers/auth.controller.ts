import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService, LoginDTO, RegisterDTO, TokenDTO } from '..';
import { CurrentUser } from '../../../common/decorator/current-user.decorator';
import { User, UserService } from '../../user';

@Controller('api/auth')
@ApiTags('authentication')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login via email and password' })
  @ApiResponse({ status: 201, description: 'Successful Login', type: TokenDTO })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() payload: LoginDTO): Promise<TokenDTO> {
    const user = await this.authService.validateUser(payload);
    return await this.authService.createToken(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
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

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Get the logged in user' })
  @Get('me')
  @ApiResponse({ status: 200, description: 'Successful Response', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLoggedInUser(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Get('mock-login')
  @ApiOperation({ summary: 'Mock Login, disabled in production' })
  @ApiResponse({ status: 201, description: 'Successful Login', type: TokenDTO })
  async mockLogin(@Query('id') id = 1): Promise<any> {
    const user = await this.userService.get(id);
    return await this.authService.createToken(user);
  }
}
