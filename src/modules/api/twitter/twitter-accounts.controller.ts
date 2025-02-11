import {
  ApiBearerAuth,
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
  other_data: any;
}

@ApiTags('Twitter Accounts')
@Controller('api/twitter/accounts')
export class TwitterAccountController {
  constructor(private readonly twitterAccountService: TwitterAccountService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get Linked Twitter Accounts',
  })
  @ApiResponse({
    status: 200,
    description: 'List of linked Twitter accounts or empty array.',
    type: [LinkedTwitterAccountDto],
  })
  async getLinkedAccounts(
    @CurrentUser() user: User,
  ): Promise<LinkedTwitterAccountDto[]> {
    const accounts = await this.twitterAccountService.getUserAccounts(user.id);
    return accounts.map((account) => ({
      screen_name: account.screen_name,
      id: account.id,
    }));
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

  @UseGuards(AuthGuard('jwt'))
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
    @CurrentUser() user: User,
  ): Promise<AddTwitterAccountResponseDto> {
    const account = new TwitterAccount();
    account.refresh_token = body.refresh_token;

    const savedAccount = await this.twitterAccountService.createAccount(
      user.id,
      account,
    );
    return {
      account: {
        screen_name: savedAccount.screen_name,
        id: savedAccount.id,
      },
    };
  }

  @Get('screen_name/:screenName/tweets/:accountId')
  @ApiOperation({ summary: 'Get Tweets by Screen Name' })
  @ApiParam({
    name: 'screenName',
    type: String,
    description: 'Screen name of the Twitter account',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tweets by the specified Twitter account.',
  })
  async getTweetsByScreenName(
    @Param('screenName') screenName: string,
    @Param('accountId') accountId: number,
  ) {
    const account = await this.twitterAccountService.getAccountWithActualTokens(
      accountId,
    );

    console.log('account', account);
    return this.twitterAccountService.getTweetsByScreenNameWithCache(
      screenName,
      account,
      '1888438983111172548',
    );
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

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
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
  async getFollowing(
    @Param('accountId') accountId: number,
    @CurrentUser() user: User,
  ): Promise<FollowingDto[]> {
    return this.twitterAccountService.getFollowing(accountId, user.id);
  }
}
