import { Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Column } from 'typeorm';
import { ApiResponseProperty } from '@nestjs/swagger';

@Entity()
export class Chatbot {
  @ApiResponseProperty()
  @PrimaryGeneratedColumn()
  id: number;
  @ApiResponseProperty()
  @Column()
  fullName: string;
  @ApiResponseProperty()
  @Column()
  description: string;
  @Column()
  backstory: string;
  @ApiResponseProperty()
  @Column()
  avatar: string;
  @ApiResponseProperty()
  @Column()
  isPublic: boolean;
  @ApiResponseProperty()
  @Column()
  creatorId: number;
  @ApiResponseProperty()
  @Column()
  ownerId: number;

  toJSON() {
    const mapped = { ...this, avatar: avatarTransformer(this) };
    console.log(mapped, this);
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
