import jwt from 'jsonwebtoken';
import { config } from '../config/app';
import { getRedisClient } from '../config/redis';
import { IJWTPayload, ITokens } from '../types';

export const generateAccessToken = (userId: number): string => {
  return (jwt as any).sign({ userId, type: 'access' } as IJWTPayload, config.jwtSecret, {
    expiresIn: config.jwtAccessExpiresIn,
  });
};

export const generateRefreshToken = (userId: number): string => {
  return (jwt as any).sign({ userId, type: 'refresh' } as IJWTPayload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn,
  });
};

export const verifyAccessToken = (token: string): IJWTPayload => {
  try {
    return (jwt as any).verify(token, config.jwtSecret) as IJWTPayload;
  } catch (error) {
    throw new Error('Недействительный access токен');
  }
};

export const verifyRefreshToken = (token: string): IJWTPayload => {
  try {
    return (jwt as any).verify(token, config.jwtRefreshSecret) as IJWTPayload;
  } catch (error) {
    throw new Error('Недействительный refresh токен');
  }
};

export const saveRefreshToken = async (userId: number, refreshToken: string): Promise<void> => {
  const redis = getRedisClient();
  const key = `refresh_token:${userId}`;
  const ms = 7 * 24 * 60 * 60 * 1000;
  await redis.set(key, refreshToken, 'PX', ms);
};

export const checkRefreshToken = async (userId: number, refreshToken: string): Promise<boolean> => {
  const redis = getRedisClient();
  const key = `refresh_token:${userId}`;
  const storedToken = await redis.get(key);
  return storedToken === refreshToken;
};

export const removeRefreshToken = async (userId: number): Promise<void> => {
  const redis = getRedisClient();
  const key = `refresh_token:${userId}`;
  await redis.del(key);
};

export const getUserIdFromToken = (token: string): number => {
  const decoded = verifyAccessToken(token);
  return decoded.userId;
};

export const generateTokens = (userId: number): ITokens => {
  return {
    accessToken: generateAccessToken(userId),
    refreshToken: generateRefreshToken(userId),
  };
};
