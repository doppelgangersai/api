import { Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Column } from 'typeorm';
import { ApiResponseProperty } from '@nestjs/swagger';

@Entity()
export class Chatbot {
  @ApiResponseProperty()
  @PrimaryGeneratedColumn()
  id: number;
  @ApiResponseProperty()
  @Column({
    nullable: true,
  })
  fullName: string;
  @ApiResponseProperty()
  @Column({
    nullable: true,
  })
  description: string;
  @Column()
  backstory: string;
  @ApiResponseProperty()
  @Column({
    nullable: true,
  })
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

  @Column({
    nullable: true,
  })
  merge1Id?: number;

  @Column({
    nullable: true,
  })
  merge2Id?: number;

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
