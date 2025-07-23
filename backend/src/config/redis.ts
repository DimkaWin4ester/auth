import Redis, { Redis as RedisClient } from 'ioredis';
import { config } from './app';

let redisClient: RedisClient | null = null;

export const connectRedis = (): void => {
  try {
    redisClient = new Redis(config.redisUrl);

    redisClient.on('error', (err: Error) => {
      console.error('Ошибка подключения к Redis:', err);
    });

    redisClient.on('connect', () => {
      console.log('Успешно подключились к Redis');
    });
  } catch (error) {
    console.error('Не удалось подключиться к Redis:', error);
    process.exit(1);
  }
};

export const getRedisClient = (): RedisClient => {
  if (!redisClient) {
    throw new Error('Redis клиент не инициализирован');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};
