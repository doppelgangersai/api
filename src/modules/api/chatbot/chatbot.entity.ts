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
