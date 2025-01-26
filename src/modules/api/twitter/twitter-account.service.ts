import { HttpException, Injectable } from '@nestjs/common';
import { TwitterAccount } from './twitter-account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TUserID } from '../user/user.types';
import { TwitterAuthService } from './twitter-auth.service';

@Injectable()
export class TwitterAccountService {
  constructor(
    @InjectRepository(TwitterAccount)
    private readonly twitterAccountRepository: Repository<TwitterAccount>,
    private readonly twitterAuthService: TwitterAuthService,
  ) {}

  async getAccountById(accountId: number): Promise<TwitterAccount> {
    return this.twitterAccountRepository.findOne(accountId);
  }

  async getUserAccounts(userId: number): Promise<TwitterAccount[]> {
    return this.twitterAccountRepository.find({ where: { user_id: userId } });
  }

  async getAccountWithActualTokens(accountId: number): Promise<TwitterAccount> {
    // gets account, checks if tokens are valid, if not, refreshes them
    const account = await this.twitterAccountRepository.findOne(accountId, {
      select: [
        'id',
        'refresh_token',
        'access_token',
        'access_token_expiry',
        'twitter_id',
        'screen_name',
      ],
    });
    if (!account) {
      throw new HttpException('Account not found', 404);
    }

    if (!account.refresh_token) {
      throw new HttpException('Refresh token is required', 400);
    }

    if (
      !account.access_token ||
      !account.access_token_expiry ||
      account.access_token_expiry < new Date()
    ) {
      const tokens = await this.twitterAuthService.getTokensByRefreshToken(
        account.refresh_token,
      );
      account.access_token = tokens.access_token;
      account.refresh_token = tokens.refresh_token;
      account.access_token_expiry = new Date();
      account.access_token_expiry.setHours(
        account.access_token_expiry.getHours() + 1,
      );
      await this.twitterAccountRepository.save(account);
    }
    return account;
  }

  async createAccount(
    userId: TUserID,
    createAccount: Partial<TwitterAccount>,
  ): Promise<TwitterAccount> {
    if (!createAccount.refresh_token) {
      throw new HttpException('Refresh token is required', 400);
    }

    const account = new TwitterAccount();
    account.user_id = userId;
    account.refresh_token = createAccount.refresh_token;

    if (!createAccount.access_token) {
      const tokens = await this.twitterAuthService.getTokensByRefreshToken(
        createAccount.refresh_token,
      );
      createAccount.access_token = tokens.access_token;
      createAccount.refresh_token = tokens.refresh_token;
    }

    const { screen_name, twitter_account_id } =
      await this.twitterAuthService.getAccountDetailsByAccessToken(
        createAccount.access_token,
      );

    account.screen_name = screen_name;
    account.twitter_id = twitter_account_id;

    const savedAccount = await this.twitterAccountRepository.save(account);

    return this.saveTokens(
      savedAccount.id,
      createAccount.access_token,
      createAccount.refresh_token,
    );
  }

  async updateAccountWithUserValidation(
    accountId: number,
    userId: TUserID,
    updateAccount: Partial<TwitterAccount>,
  ): Promise<TwitterAccount> {
    const account = await this.twitterAccountRepository.findOne(accountId);

    if (!account) {
      throw new HttpException('Account not found', 404);
    }

    if (account.user_id !== userId) {
      throw new HttpException('Access denied', 403);
    }

    const { refresh_token, access_token } = updateAccount;

    if (!access_token && !refresh_token) {
      throw new HttpException('No data to update', 400);
    }

    if (!access_token && refresh_token) {
      const tokens = await this.twitterAuthService.getTokensByRefreshToken(
        refresh_token,
      );
      updateAccount.access_token = tokens.access_token;
    }

    return this.saveTokens(
      accountId,
      updateAccount.access_token,
      updateAccount.refresh_token,
    );
  }

  async saveTokens(
    accountId: number,
    accessToken: string,
    refreshToken: string,
  ): Promise<TwitterAccount> {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1); // Set expiry to one hour from now

    await this.twitterAccountRepository.update(
      { id: accountId },
      {
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expiry: expiryDate,
      },
    );

    return this.twitterAccountRepository.findOne(accountId);
  }
}
