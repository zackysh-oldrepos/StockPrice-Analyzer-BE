import { HttpException } from '@/exceptions/HttpException';
import { TokenPayload } from '@/types/auth/auth.types';

import { User } from '@/types/user/user.types';
import jwt from 'jsonwebtoken';
import { _titleCase } from './util';

export function signUserToken(user: User, expiresIn: number, secret: string) {
  // Store token payload
  const payload: TokenPayload = {
    userId: user.userId,
  };
  // sign token with payload and secret
  return jwt.sign(payload, secret, {
    expiresIn: expiresIn,
  });
}

/**
 * Validate provided token.
 * It shouldn't have expired and should be well formed.
 *
 * @param type neccesary to infer secret key
 * @param requiredKeys keys that payload must have
 * @throws 401 when any rule is broken
 * @returns decoded token if it's valid
 */
export function validateToken(
  token: string,
  type: 'access' | 'refresh',
  requiredKeys: string[],
): TokenPayload {
  const secret = type === 'access' ? process.env.ACCESS_SECRET : process.env.REFRESH_SECRET;
  let decoded: TokenPayload;

  token = token.toLocaleLowerCase().includes('bearer') ? token.slice(7) : token;

  try {
    // Is jwt?
    decoded = jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    throw new HttpException(401, `Invalid ${type} token`);
  }

  // Is well payload formed?
  const isWellFormed = requiredKeys.every(key => Object.keys(decoded).find(dKey => dKey === key));
  // If it's not well formed
  if (!decoded || !isWellFormed)
    throw new HttpException(401, `${_titleCase(type)} token payload isn't valid`);
  // If token is expired
  if (Date.now() >= decoded.exp * 1000)
    throw new HttpException(401, `${_titleCase(type)} token expired`);

  return decoded;
}
