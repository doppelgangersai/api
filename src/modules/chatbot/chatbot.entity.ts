import { Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Column } from 'typeorm';

@Entity()
export class Chatbot {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  fullName: string;
  @Column()
  description: string;
  @Column()
  backstory: string;
  @Column()
  avatar: string;
  @Column()
  isPublic: boolean;
  @Column()
  creatorId: number;
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
