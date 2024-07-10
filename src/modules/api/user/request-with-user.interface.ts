import { Request } from 'express';
import { User } from './user.entity'; // Импортируйте ваш User entity

export interface RequestWithUser extends Request {
  user: User;
}
