import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MandrillEmailService } from 'modules/mail/mandrill-email.service';
import { User, UserFillableFields } from './user.entity';
import { TUserID } from './user.types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly emailService: MandrillEmailService,
  ) {}

  async get(id: number) {
    return this.usersRepository.findOne({ id });
  }

  async getTwitterRefreshToken(
    userOrUserId: TUserID | Partial<User>,
  ): Promise<string> {
    if (typeof userOrUserId !== 'number') {
      return userOrUserId.twitterRefreshToken;
    }
    const user = await this.get(userOrUserId);
    return user.twitterRefreshToken;
  }

  async countReferrals(id: number) {
    return this.usersRepository.count({ referrerId: id });
  }

  async getByEmail(email: string) {
    return await this.usersRepository.findOne({ email });
  }

  async getByAppleSubId(sub: string) {
    return this.usersRepository.findOne({ appleSubId: sub });
  }

  // TODO: remove?
  async getOrCreateByEmail(email: string) {
    let user = await this.getByEmail(email);
    if (!user) {
      user = await this.create({ email });
    }
    return user;
  }

  async createSecured(payload: UserFillableFields) {
    const user = await this.getByEmail(payload.email);

    if (user) {
      throw new NotAcceptableException(
        'User with provided email already created.',
      );
    }

    return await this.usersRepository.save(payload);
  }

  async create(payload: Partial<User>) {
    const user = await this.getByEmail(payload.email);

    if (user) {
      throw new NotAcceptableException(
        'User with provided email already created.',
      );
    }

    return await this.usersRepository.save(payload).then(async(userData) => {
      await this.sendWelcomeEmail({
        email: userData.email,
        userName: userData.fullName
      });

      return userData;
    });
  }

  async update(id, user: Partial<User>) {
    return await this.usersRepository.update(id, { ...user });
  }

  async addFriend(userId: TUserID, friendId: number): Promise<void> {
    const user = await this.usersRepository.findOne(userId, {
      relations: ['friends'],
    });
    const friend = await this.usersRepository.findOne(friendId);

    if (user && friend) {
      user.friends.push(friend);
      await this.usersRepository.save(user);
    }
  }

  async getFriends(userId: TUserID): Promise<User[]> {
    const user = await this.usersRepository.findOne(userId, {
      relations: ['friends'],
    });
    return user?.friends || [];
  }

  async reward(id: number, points = 20) {
    return await this.usersRepository.increment({ id }, 'points', points);
  }

  async getOrCreateByNearAccountId(
    nearAccountId: string,
    nearPublicKey: string,
    referrerId?: number,
  ) {
    const user = await this.usersRepository.findOne({
      where: { nearAccountId },
    });
    if (!user) {
      return await this.create({ nearAccountId, nearPublicKey, referrerId });
    }
    return user;
  }

  async delete(id: number) {
    return await this.usersRepository.softDelete(id);
  }

  private async sendWelcomeEmail({
    email,
    userName,
  }: {
    email: string,
    userName: string
  }): Promise<void> {
    await this.emailService.sendEmail({
      to: email,
      subject: 'Welcome to Doppelgangers AI!',
      userName,
      templateName: 'welcome'
    });
  }
}
