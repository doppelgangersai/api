import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpException,
  HttpStatus,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { TwitterAccountService } from './twitter-account.service';
import { TwitterAccount } from './twitter-account.entity';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { User } from '../user';

class LinkedTwitterAccountDto {
  @ApiProperty({ description: 'Screen name of the Twitter account' })
  screen_name: string;

  @ApiProperty({ description: 'ID of the Twitter account in DB' })
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
  constructor(private readonly twitterAccountService: TwitterAccountService) {}

  @Get()
  @ApiOperation({
    summary:
      '[draft][mock] Get Linked Twitter Accounts (i`m ready to remove this mock and enable real data)',
  })
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

  @Get(':accountId')
  @ApiOperation({ summary: 'Get Twitter Account by ID' })
  @ApiParam({
    name: 'accountId',
    type: Number,
    description: 'ID of the Twitter account',
  })
  @ApiResponse({
    status: 200,
    description: 'Details of the Twitter account.',
    type: LinkedTwitterAccountDto,
  })
  async getAccountById(
    @Param('accountId') accountId: number,
  ): Promise<TwitterAccount> {
    // TODO: add user validation
    const account = await this.twitterAccountService.getAccountById(accountId);
    if (!account) {
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
    return account;
  }

  @Post()
  @ApiOperation({ summary: 'Add New Twitter Account' })
  @ApiBody({ type: AddTwitterAccountDto })
  @ApiResponse({
    status: 201,
    description:
      'Twitter account added successfully. Returns details of the account.',
    type: AddTwitterAccountResponseDto,
  })
  async addTwitterAccount(
    @Body() body: AddTwitterAccountDto,
  ): Promise<AddTwitterAccountResponseDto> {
    const account = new TwitterAccount();
    account.refresh_token = body.refresh_token;

    const savedAccount = await this.twitterAccountService.createAccount(
      account,
    );
    return {
      account: {
        screen_name: savedAccount.screen_name,
        id: savedAccount.id,
      },
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':accountId')
  @ApiOperation({ summary: 'Update Twitter Account' })
  @ApiParam({
    name: 'accountId',
    type: Number,
    description: 'ID of the Twitter account to update',
  })
  @ApiBody({
    description: 'Updated Twitter account details',
    type: TwitterAccount,
  })
  @ApiResponse({
    status: 200,
    description: 'Twitter account updated successfully.',
    type: LinkedTwitterAccountDto,
  })
  async updateAccount(
    @Param('accountId') accountId: number,
    @Body() body: LinkedTwitterAccountDto,
    @CurrentUser() user: User,
  ): Promise<TwitterAccount> {
    return this.twitterAccountService.updateAccountWithUserValidation(
      accountId,
      user.id,
      body,
    );
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
