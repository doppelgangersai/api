import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { PasswordTransformer } from './password.transformer';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IDoppelganger } from '../../doppelganger/doppelganger.interace';

@Entity({
  name: 'users',
})
export class User implements IDoppelganger {
  @ApiResponseProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ required: false, example: 'John Doe' })
  @Column({ length: 255, nullable: true })
  fullName: string;

  @ApiProperty({ required: false, example: 'john_doe' })
  @Column({ length: 255, nullable: true, unique: true })
  username: string;

  @ApiResponseProperty({ example: 'john@do.e' })
  @Column({ length: 255, nullable: true })
  email: string;

  @ApiProperty({
    required: false,
    example: '24be010483dccbb08c972bcb5bbe67f8505d6f8aedd701684a36561a1c83c96b',
  })
  @Column({ length: 255, nullable: true })
  nearAccountId: string;

  @Column({ length: 255, nullable: true })
  nearPublicKey: string;

  @ApiProperty({ required: false, example: 'https://example.com/avatar.jpg' })
  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({
    name: 'password',
    length: 255,
    transformer: new PasswordTransformer(),
    nullable: true,
  })
  password: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true, select: false })
  googleAccessToken: string;

  @Column({ nullable: true })
  twitterRefreshToken: string;

  @Column({ nullable: true })
  twitterUserId: string;

  @Column({ nullable: true })
  twitterUsername: string;

  @Column({ nullable: true })
  appleId: string;

  @Column({ nullable: true, select: false })
  appleAccessToken: string;

  @Column({ nullable: true })
  instagramFile: string;

  @Column({ nullable: true })
  linkedInFile: string;

  @Column({ nullable: true })
  whatsAppFile: string;

  @Column({ nullable: true })
  facebookFile: string;

  @Column({ nullable: true })
  messengerFile: string;

  @Column({ nullable: true })
  telegramFile: string;

  @Column({ nullable: true })
  xUsername: string;

  @Column({ nullable: true })
  tikTokUsername: string;

  @ApiResponseProperty()
  @Column({ nullable: true, default: 0 })
  points: number;

  @Column({ nullable: true, type: 'text' })
  backstory: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  telegramAuthSession: string;

  @Column({
    nullable: true,
  })
  chatbotId: number;

  @ManyToMany(() => User, (user) => user.friends)
  @JoinTable()
  friends: User[];

  @ApiResponseProperty()
  isTelegramConnected: boolean;

  @ApiResponseProperty()
  isInstagramConnected: boolean;

  // @ApiResponseProperty()
  // @Column('text', { nullable: true, array: true })
  // tags: string[];

  toJSON() {
    const {
      password,
      googleAccessToken,
      appleAccessToken,
      telegramAuthSession,
      telegramFile,
      instagramFile,
      backstory,
      nearPublicKey,
      ...self
    } = this;
    return {
      ...self,
      isTelegramConnected: !!telegramAuthSession,
      isInstagramConnected: !!instagramFile,
      avatar: avatarTransformer(this),
    };
  }

  @Column({
    nullable: true,
  })
  referrerId?: number;
}

export class UserFillableFields {
  email: string;
  fullName: string;
  password: string;
}

const avatarTransformer = (self: User) => {
  return self?.avatar
    ? self.avatar.includes('http')
      ? self.avatar
      : `/avatars/${self.avatar}`
    : null;
};

export class MappedUserDTO extends User {
  @ApiResponseProperty()
  isTelegramConnected: boolean;
  @ApiResponseProperty()
  isInstagramConnected: boolean;
}
