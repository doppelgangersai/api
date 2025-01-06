import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TokenDTO } from '../auth.dtos';
import { UserService } from '../../user';
import { AuthService } from '../services';

// DTO query:
// http://localhost:3001/?account_id=24be010483dccbb08c972bcb5bbe67f8505d6f8aedd701684a36561a1c83c96b&all_keys=ed25519%3A3URid12St7mSsRzwZV6cvDETFmgLvEz7JP8V89HeNsdc
// http://localhost:3000/?account_id=vvm77.near&public_key=ed25519%3AAWDLXPBAWqdGTVJMrGC55dxv97Ww9P48UfTAvGqGErT4

export class NearAuthDto {
  account_id: string;
  all_keys?: string;
  public_key?: string;
  ref?: string;
}

@ApiTags('auth')
@Controller('api/auth/near')
export class NearController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: TokenDTO,
  })
  @ApiQuery({
    name: 'account_id',
    required: true,
    description: 'Account ID',
  })
  @ApiQuery({
    name: 'all_keys',
    required: false,
    description: 'All keys',
  })
  @ApiQuery({
    name: 'public_key',
    required: false,
    description: 'Public key',
  })
  @ApiQuery({
    name: 'ref',
    required: false,
    description: 'Optional referral code for tracking the origin of signup',
  })
  @ApiOperation({ summary: 'WIP: Near Auth' })
  @Get()
  async auth(@Query() query: NearAuthDto) {
    const referrerId = (query.ref && parseInt(query.ref, 10)) || null;
    const user = await this.userService.getOrCreateByNearAccountId(
      query.account_id,
      query.all_keys || query.public_key,
      referrerId,
    );
    return this.authService.createToken(user);
  }
}
