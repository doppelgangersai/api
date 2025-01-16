import { User } from '../user';
import { TChatID } from './chat.types';

export interface IChatMessage {
  id: number;
  text: string;
  createdAt: Date;
}

export interface IChatMessageWithUser extends IChatMessage {
  from: Partial<User>;
}

export interface IChat {
  id: TChatID;
  title: string;
  messages: IChatMessageWithUser[];
  user: Partial<User>;
}
