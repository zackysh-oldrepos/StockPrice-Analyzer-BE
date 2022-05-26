import { Request } from 'express';
import { User } from '../user/user.types';

export interface RequestWithUser extends Request {
  user: User;
}

export interface TokenPayload {
  userId: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Code {
  userId: number;
  code: string;
}
