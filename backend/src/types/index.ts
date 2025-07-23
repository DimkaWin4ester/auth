import { Request } from 'express';

export interface IUser {
  id: number;
  email: string;
  password: string;
  createdAt: Date;
}

export interface IUserResponse {
  id: number;
  email: string;
  createdAt: Date;
}

export interface IJWTPayload {
  userId: number;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
}

export interface IRefreshRequest {
  refreshToken: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ILoginResponse {
  message: string;
  user: IUserResponse;
}

export interface IRegisterResponse {
  message: string;
  user: IUserResponse;
}

export interface IRefreshResponse {
  message: string;
}

export interface ILogoutResponse {
  message: string;
}

export interface IChangePasswordResponse {
  message: string;
  note: string;
}

export interface IMeResponse {
  user: IUserResponse;
}

export interface IErrorResponse {
  error: string;
  message: string;
}

export interface IAuthenticatedRequest extends Request {
  user?: {
    userId: number;
  };
}

export interface IRedisConfig {
  url: string;
}

export interface IDatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface IAppConfig {
  port: number;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  redisUrl: string;
  nodeEnv: string;
  database: IDatabaseConfig;
}
