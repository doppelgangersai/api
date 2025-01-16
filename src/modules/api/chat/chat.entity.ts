import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TChatID } from './chat.types';
import { TUserID } from '../user/user.types';
import { TChatbotID } from '../chatbot/chatbot.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: TChatID;

  @Column({ nullable: true })
  provider_name: string;

  @Column({ nullable: true })
  provider_internal_id: string;

  @Column({ nullable: true })
  with_user_id: TChatbotID;

  @Column()
  from_user_id: TUserID;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
