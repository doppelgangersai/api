import { DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Column } from 'typeorm';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
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
    default: 10,
  })
  post_per_day?: number;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  comment_enabled?: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
    default: false,
  })
  comment_verified_only?: boolean;

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

  @Column({
    type: 'integer',
    nullable: true,
    default: 10,
  })
  comment_per_day?: number;

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

  @Column({
    type: 'boolean',
    nullable: true,
  })
  agent_experimental?: boolean;

  @Column({
    type: 'boolean',
    nullable: true,
  })
  agent_enabled: boolean;

  @Column({
    type: 'integer',
    nullable: true,
  })
  post_session_count: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  agent_session_reset: Date;

  @Column({
    type: 'integer',
    nullable: true,
  })
  comment_session_count: number;

  // comments and posts last interacted tweets
  @Column({
    type: 'text',
    nullable: true,
  })
  post_last_interacted_tweet_id?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  comment_last_interacted_tweet_id?: string;

  toJSON() {
    const { backstory, ...self } = this;
    const mapped = { ...self, avatar: avatarTransformer(this) };
    return mapped;
  }
}

const avatarTransformer = (self: Chatbot): string => {
  if (!self?.avatar) return null;

  if (self.avatar.includes('http')) {
    return self.avatar;
  }

  return `/api/storage/avatars/${self.avatar}`;
};
