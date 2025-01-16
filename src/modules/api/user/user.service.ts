import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

import { User, UserFillableFields } from './user.entity';
import { TUserID } from './user.types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // DB START

  async get(id: TUserID) {
    return this.usersRepository.findOne({ id });
  }

  async getByEmail(email: string) {
    return await this.usersRepository.findOne({ email });
  }

  async getByNearAccountId(nearAccountId: string) {
    return this.usersRepository.findOne({ nearAccountId });
  }

  async save(user: Partial<User>) {
    return this.usersRepository.save(user);
  }

  async countReferrals(id: TUserID) {
    return this.usersRepository.count({ referrerId: id });
  }

  async update(id: TUserID, user: Partial<User>) {
    return await this.usersRepository.update(id, { ...user });
  }

  async getUserWithFriends(id: TUserID) {
    return this.usersRepository.findOne(id, {
      relations: ['friends'],
    });
  }

  // / DB END

  async getTwitterRefreshToken(
    userOrUserId: TUserID | Partial<User>,
  ): Promise<string> {
    if (typeof userOrUserId === 'object') {
      return userOrUserId.twitterRefreshToken;
    }
    const user = await this.get(userOrUserId);
    return user.twitterRefreshToken;
  }

  async createSecured(payload: UserFillableFields) {
    const user = await this.getByEmail(payload.email);

    if (user) {
      throw new NotAcceptableException(
        'User with provided email already created.',
      );
    }

    return await this.save(payload);
  }

  async create(payload: Partial<User>) {
    const user = await this.getByEmail(payload.email);

    if (user) {
      throw new NotAcceptableException(
        'User with provided email already created.',
      );
    }

    return await this.save(payload);
  }

  async addFriend(userId: TUserID, friendId: TUserID): Promise<void> {
    const user = await this.getUserWithFriends(userId);
    const friend = await this.get(friendId);

    if (user && friend) {
      user.friends.push(friend);
      await this.save(user);
    }
  }

  async getFriends(userId: TUserID): Promise<User[]> {
    const user = await this.getUserWithFriends(userId);
    return user?.friends || [];
  }

  async getOrCreateByNearAccountId(
    nearAccountId: string,
    nearPublicKey: string,
    referrerId?: number,
  ) {
    const user = await this.getByNearAccountId(nearAccountId);
    if (!user) {
      return await this.create({ nearAccountId, nearPublicKey, referrerId });
    }
    return user;
  }
}
