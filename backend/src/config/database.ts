import { Sequelize } from 'sequelize';
import { config } from './app';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  define: {
    timestamps: true,
    underscored: true,
  },
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ База данных PostgreSQL подключена');
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    process.exit(1);
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('📴 Соединение с базой данных закрыто');
  } catch (error) {
    console.error('❌ Ошибка при закрытии соединения с БД:', error);
  }
};
