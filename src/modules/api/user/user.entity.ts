import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinTable,
  ManyToMany,
  DeleteDateColumn,
} from 'typeorm';
import { PasswordTransformer } from './password.transformer';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IDoppelganger } from '../../doppelganger/doppelganger.interace';

export enum ConnectionStatus {
  UNCONNECTED = 'unconnected',
  CONNECTED = 'connected',
  PROCESSED = 'processed',
  DISCONNECTED = 'disconnected',
}

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

  @ApiResponseProperty({
    example: '123456789',
  })
  @Column({ nullable: true })
  twitterUserId: string;

  @ApiResponseProperty({
    example: 'john_doe',
  })
  @Column({ nullable: true })
  twitterUsername: string;

  @Column({ nullable: true })
  appleId: string;

  @Column({ nullable: true, select: false })
  appleSubId: string;

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

  // @Column({ nullable: true })
  // xUsername: string;

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

  @Column({
    nullable: true,
  })
  twitterAccountId: number;

  @ManyToMany(() => User, (user) => user.friends)
  @JoinTable()
  friends: User[];

  @ApiResponseProperty()
  isTelegramConnected: boolean;

  @ApiResponseProperty()
  isInstagramConnected: boolean;

  @ApiProperty({
    description: 'Twitter connection status',
    enum: ConnectionStatus,
    example: ConnectionStatus.UNCONNECTED,
  })
  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.UNCONNECTED,
  })
  twitterConnectionStatus: ConnectionStatus;

  @ApiProperty({
    description: 'Instagram connection status',
    enum: ConnectionStatus,
    example: ConnectionStatus.CONNECTED,
  })
  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.UNCONNECTED,
  })
  instagramConnectionStatus: ConnectionStatus;

  @ApiProperty({
    description: 'Telegram connection status',
    enum: ConnectionStatus,
    example: ConnectionStatus.PROCESSED,
  })
  @Column({
    type: 'enum',
    enum: ConnectionStatus,
    default: ConnectionStatus.UNCONNECTED,
  })
  telegramConnectionStatus: ConnectionStatus;

  @ApiProperty({
    required: false,
    example: 'eB_JLEYzSYqk-PtxmqDtbf:APA91bHqpNGFN...',
    description: 'Firebase Cloud Messaging token for push notifications',
  })
  @Column({ nullable: true })
  fcmToken: string;

  @ApiResponseProperty()
  @Column({ default: false, nullable: true })
  isAdmin: boolean;

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
      linkedInFile,
      whatsAppFile,
      facebookFile,
      messengerFile,
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

  @DeleteDateColumn()
  deletedAt?: Date;
}

export class UserFillableFields {
  email: string;
  fullName: string;
  password: string;
}

const avatarTransformer = (self: User) => {
  if (!self?.avatar) return null;

  if (self.avatar.includes('http')) {
    return self.avatar;
  }

  return `/api/storage/avatars/${self.avatar}`;
};

export class MappedUserDTO extends User {
  @ApiResponseProperty()
  isTelegramConnected: boolean;
  @ApiResponseProperty()
  isInstagramConnected: boolean;
}
