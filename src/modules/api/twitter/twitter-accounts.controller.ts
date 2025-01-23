import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';

class LinkedTwitterAccountDto {
  @ApiProperty({ description: 'Screen name of the Twitter account' })
  screen_name: string;

  @ApiProperty({ description: 'ID of the Twitter account' })
  id: number;
}

class AddTwitterAccountDto {
  @ApiProperty({
    description: 'Refresh token for adding a new Twitter account',
    example: 'some_token',
  })
  refresh_token: string;
}

class AddTwitterAccountResponseDto {
  @ApiProperty({ description: 'Details of the added Twitter account' })
  account: LinkedTwitterAccountDto;
}
class FollowingDto {
  @ApiProperty({ description: 'Screen name of the followed account' })
  screen_name: string;

  @ApiProperty({ description: 'Whether the account is verified' })
  is_verified: boolean;

  @ApiProperty({
    description:
      'Additional data from Twitter. Ignore it. Just an example string property.',
  })
  other_data: string;
}
@ApiTags('Twitter Accounts')
@Controller('api/twitter/accounts')
export class TwitterAccountController {
  @Get()
  @ApiOperation({ summary: '[draft][mock] Get Linked Twitter Accounts' })
  @ApiResponse({
    status: 200,
    description: 'List of linked Twitter accounts.',
    type: [LinkedTwitterAccountDto],
  })
  getLinkedAccounts(): LinkedTwitterAccountDto[] {
    return [
      {
        screen_name: 'elonmusk',
        id: 7,
      },
      {
        screen_name: 'NearProtocol',
        id: 5,
      },
    ];
  }

  @Post()
  @ApiOperation({ summary: '[mock] Add New Twitter Account' })
  @ApiBody({ type: AddTwitterAccountDto })
  @ApiResponse({
    status: 201,
    description:
      'Twitter account added successfully. Returns id of the account in our DB.',
    type: AddTwitterAccountResponseDto,
  })
  addTwitterAccount(
    @Body() body: AddTwitterAccountDto,
  ): AddTwitterAccountResponseDto {
    return {
      account: {
        screen_name: 'elonmusk',
        id: 7,
      },
    };
  }

  @Get(':accountId/following')
  @ApiOperation({ summary: '[mock] Get Twitter Following' })
  @ApiParam({
    name: 'accountId',
    type: Number,
    description: 'ID of the Twitter account',
  })
  @ApiResponse({
    status: 200,
    description: 'List of accounts the specified Twitter account follows.',
    type: [FollowingDto],
  })
  getFollowing(@Param('accountId') accountId: number): FollowingDto[] {
    return [
      {
        screen_name: 'SpaceX',
        is_verified: true,
        other_data: 'extra data from Twitter',
      },
      {
        screen_name: 'Tesla',
        is_verified: true,
        other_data: 'extra data from Twitter',
      },
    ];
  }
}
