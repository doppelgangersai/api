import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserFillableFields } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async get(id: number) {
    return this.userRepository.findOne({ id });
  }

  async getByEmail(email: string) {
    return await this.userRepository.findOne({ email });
  }

  async getOrCreateByEmail(email: string) {
    let user = await this.getByEmail(email);
    if (!user) {
      user = await this.create({ email });
    }
    console.log('user', user);
    return user;
  }

  async createSecured(payload: UserFillableFields) {
    const user = await this.getByEmail(payload.email);

    if (user) {
      throw new NotAcceptableException(
        'User with provided email already created.',
      );
    }

    return await this.userRepository.save(payload);
  }

  async create(payload: Partial<User>) {
    const user = await this.getByEmail(payload.email);

    if (user) {
      throw new NotAcceptableException(
        'User with provided email already created.',
      );
    }

    return await this.userRepository.save(payload);
  }

  async update(id, user: Partial<User>) {
    return await this.userRepository.update(id, { ...user });
  }
}
