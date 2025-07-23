import { NextFunction, Response } from 'express';
import { IAuthenticatedRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';

export const authenticateToken = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies['accessToken'];
  console.log('Auth middleware - cookies:', req.cookies);
  console.log('Auth middleware - token:', token ? 'exists' : 'missing');

  if (!token) {
    console.log('Auth middleware - no token provided');
    res.status(401).json({
      error: 'Токен доступа не предоставлен',
      message: 'Требуется аутентификация',
    });
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    console.log('Auth middleware - token verified, userId:', decoded.userId);
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    console.log('Auth middleware - token verification failed:', error);
    res.status(403).json({
      error: 'Недействительный токен',
      message: error instanceof Error ? error.message : 'Неизвестная ошибка',
    });
  }
};

export const optionalAuth = (
  req: IAuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies['accessToken'];

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      req.user = { userId: decoded.userId };
    } catch (error) {}
  }

  next();
};
