import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Response } from 'express';

import { config } from './config/app';
import { initializeDatabase } from './config/database';
import { connectRedis } from './config/redis';
import routes from './routes';

startServer();

async function startServer() {
  const app = express();

  await initializeDatabase();
  connectRedis();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: 'http://localhost:4001',
      credentials: true,
    }),
  );

  app.use('/api', routes);

  app.use((err: Error, _req: express.Request, res: Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      error: 'Что-то пошло не так!',
      message: config.nodeEnv === 'development' ? err.message : 'Внутренняя ошибка сервера',
    });
  });

  app.use('*', (_, res: Response) => {
    res.status(404).json({ error: 'Эндпоинт не найден' });
  });

  app.listen(config.port, () => {
    console.log(`Сервер запущен на порту ${config.port}`);
    console.log(`Health check: http://localhost:${config.port}`);
  });
}
