import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TokenDTO } from '../auth.dtos';

// DTO query:
// http://localhost:3001/?account_id=24be010483dccbb08c972bcb5bbe67f8505d6f8aedd701684a36561a1c83c96b&all_keys=ed25519%3A3URid12St7mSsRzwZV6cvDETFmgLvEz7JP8V89HeNsdc
// http://localhost:3000/?account_id=vvm77.near&public_key=ed25519%3AAWDLXPBAWqdGTVJMrGC55dxv97Ww9P48UfTAvGqGErT4

export class NearAuthDto {
  account_id: string;
  all_keys?: string;
  public_key?: string;
}

@ApiTags('auth')
@Controller('api/auth/near')
export class NearController {
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
  @Get()
  async auth(@Query() query: NearAuthDto) {
    return {
      accessToken: 'string',
      expiresIn: 'string',
      user: {
        id: 0,
        fullName: 'John Doe',
        username: 'john_doe',
        email: 'john@do.e',
        avatar: 'https://example.com/avatar.jpg',
        instagramFile: 'string',
        points: 0,
      },
    };
  }
}
