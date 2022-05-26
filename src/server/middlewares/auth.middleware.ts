/* eslint-disable prettier/prettier */
import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/types/auth/auth.types';
import { validateToken } from '@/utils/auth.utils';
import { NextFunction, Response } from 'express';

async function authMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
  // @ Validate token
  const accessToken = req.headers['authorization'] as string;
  if (!accessToken) next(new HttpException(401, 'No token provided'));
  try {
    validateToken(accessToken, 'access', ['userId']);
    next();
  } catch (err) {
    next(
      err.status
        ? err
        : new HttpException(
          500,
          err.message || process.env.NODE_ENV === 'development' ? err : 'Internal server error',
        ),
    );
  }
}

export default authMiddleware;
