import { Injectable } from '@nestjs/common';
import { TwitterAccount } from './twitter-account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TUserID } from '../user/user.types';

@Injectable()
export class TwitterAccountService {
  constructor(
    @InjectRepository(TwitterAccount)
    private readonly twitterAccountRepository: Repository<TwitterAccount>,
  ) {}
  async getAccountById(accountId: number): Promise<TwitterAccount> {
    return this.twitterAccountRepository.findOne(accountId);
  }
  async getUserAccounts(userId: number): Promise<TwitterAccount[]> {
    return this.twitterAccountRepository.find({ where: { user_id: userId } });
  }
  async createAccount(account: TwitterAccount): Promise<TwitterAccount> {
    return this.twitterAccountRepository.save(account);
  }
  async updateAccountWithUserValidation(
    accountId: number,
    userId: TUserID,
    updateAccount: Partial<TwitterAccount>,
  ): Promise<TwitterAccount> {
    const account = await this.twitterAccountRepository.findOne(accountId);
    if (account.user_id !== userId) {
      throw new Error('Account not found');
    }
    return this.twitterAccountRepository.save({
      user_id: userId,
      ...account,
      ...updateAccount,
    });
  }
}
