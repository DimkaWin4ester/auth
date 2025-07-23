import 'dotenv/config';
import { IAppConfig } from '../types';

const env = process.env as Record<string, string>;

export const config: IAppConfig = {
  port: env['PORT'] ? parseInt(env['PORT'], 10) : 4002,
  jwtSecret: env['JWT_SECRET'] || 'default-secret',
  jwtRefreshSecret: env['JWT_REFRESH_SECRET'] || 'default-refresh-secret',
  jwtAccessExpiresIn: env['JWT_ACCESS_EXPIRES_IN'] || '15m',
  jwtRefreshExpiresIn: env['JWT_REFRESH_EXPIRES_IN'] || '7d',
  redisUrl: env['REDIS_URL'] || 'redis://localhost:6379',
  nodeEnv: env['NODE_ENV'] || 'development',

  database: {
    host: env['DB_HOST'] || 'localhost',
    port: env['DB_PORT'] ? parseInt(env['DB_PORT'], 10) : 5432,
    username: env['DB_USERNAME'] || 'postgres',
    password: env['DB_PASSWORD'] || 'password',
    database: env['DB_NAME'] || 'auth_backend',
  },
};

validateConfig(config);

function validateConfig(config: Record<string, any>, path: string = '') {
  for (const key in config) {
    if (config[key] === undefined) {
      throw new Error(`Missing required configuration field: ${path}${key}`);
    }

    if (typeof config[key] === 'object' && config[key] !== null) {
      validateConfig(config[key], `${key}.`);
    }
  }
}
