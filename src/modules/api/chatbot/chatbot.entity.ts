import { Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Column } from 'typeorm';
import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IDoppelganger } from '../../doppelganger/doppelganger.interace';

@Entity()
export class Chatbot implements IDoppelganger {
  @ApiResponseProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  fullName: string;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  title: string;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  description: string;

  @Column()
  backstory: string;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  avatar: string;

  @ApiProperty()
  @Column()
  isPublic: boolean;

  @ApiProperty()
  @Column({
    nullable: true,
  })
  isModified: boolean;

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
    const { backstory, ...self } = this;
    const mapped = { ...self, avatar: avatarTransformer(this) };
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
