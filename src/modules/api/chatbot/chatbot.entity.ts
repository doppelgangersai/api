import { DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Column } from 'typeorm';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
} from '@nestjs/swagger';
import { IDoppelganger } from '../../doppelganger/doppelganger.interace';
import { ChatbotSource } from './chatbot.types';

@Entity()
export class Chatbot implements IDoppelganger {
  @ApiResponseProperty({
    type: Number,
    example: 7,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'John Doe & Jane Doe',
  })
  @Column({
    nullable: true,
  })
  fullName: string;

  @ApiProperty({
    example: 'John & Jane',
  })
  @Column({
    nullable: true,
  })
  title: string;

  @ApiProperty({
    example: 'John & Jane are a couple of doppelgangers',
  })
  @Column({
    nullable: true,
  })
  description: string;

  @Column()
  backstory: string;

  @ApiProperty({
    example: 'http://example.com/avatar.png',
  })
  @Column({
    nullable: true,
  })
  avatar: string;

  @ApiProperty({
    example: true,
  })
  @Column()
  isPublic: boolean;

  @ApiProperty({
    example: true,
  })
  @Column({
    nullable: true,
  })
  isModified: boolean;

  @ApiResponseProperty({
    type: Number,
    example: 1,
  })
  @Column()
  creatorId: number;

  @ApiResponseProperty({
    type: Number,
    example: 1,
  })
  @Column()
  ownerId: number;

  @Column({
    nullable: true,
  })
  merge1Id?: number;

  @Column({
    nullable: true,
  })
  merge2Id?: number;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ApiResponseProperty({
    type: String,
    example: 'twitter',
  })
  @Column({
    type: 'enum',
    enum: ChatbotSource,
    default: ChatbotSource.UNKNOWN,
  })
  source: ChatbotSource;

  @Column({
    nullable: true,
  })
  twitterRefreshToken: string;

  @Column({
    nullable: true,
  })
  twitterUsername: string;

  @Column({
    nullable: true,
  })
  twitterUserId: string;

  @Column({
    nullable: true,
  })
  twitterAccountId: number;

  // Fields for post_settings (internal use)
  @Column({
    type: 'boolean',
    nullable: true,
  })
  post_enabled?: boolean;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  post_accounts?: string[];

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  post_keywords?: string[];

  @Column({
    type: 'text',
    nullable: true,
  })
  post_prompt?: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  post_per_day?: number;

  // Fields for comment_settings (internal use)
  @Column({
    type: 'boolean',
    nullable: true,
  })
  comment_enabled?: boolean;

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  comment_accounts?: string[];

  @Column({
    type: 'boolean',
    nullable: true,
  })
  comment_reply_when_tagged?: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  comment_x_accounts_replies?: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  comment_my_accounts_replies?: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  comment_prompt?: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  comment_min_followers?: number;

  @Column({
    type: 'integer',
    nullable: true,
  })
  comment_older_then?: number;

  // New internal fields: post_last_check and comment_last_check

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  post_last_check?: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  comment_last_check?: Date;

  // last_agent_error and last_agent_error_message
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  last_agent_error?: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  last_agent_error_message?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  post_last_checked_tweet_id?: string;

  toJSON() {
    const { backstory, ...self } = this;
    const mapped = { ...self, avatar: avatarTransformer(this) };
    return mapped;
  }
}

const avatarTransformer = (self: Chatbot): string => {
  return self?.avatar
    ? self.avatar.includes('http')
      ? self.avatar
      : `/avatars/${self.avatar}`
    : null;
};
