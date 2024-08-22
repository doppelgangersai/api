import { User } from '../user';

export interface IChatMessage {
  id: number;
  text: string;
  createdAt: Date;
}

export interface IChatMessageWithUser extends IChatMessage {
  from: Partial<User>;
}

export interface IChat {
  id: number;
  title: string;
  messages: IChatMessageWithUser[];
}
