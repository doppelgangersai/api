import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { PasswordTransformer } from './password.transformer';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

@Entity({
  name: 'users',
})
export class User {
  @ApiResponseProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ required: false, example: 'John Doe' })
  @Column({ length: 255, nullable: true })
  fullName: string;

  @Column({ length: 255 })
  email: string;

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

  @Column({ nullable: true, default: 0 })
  points: number;

  @Column({ nullable: true, type: 'text' })
  backstory: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  telegramAuthSession: string;

  toJSON() {
    const { password, ...self } = this;
    return { ...self, avatar: avatarTransformer(this) };
  }

  isTelegramConnected() {
    return !!this.telegramAuthSession;
  }
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
