-- Инициализация базы данных для auth backend
-- Этот скрипт выполняется при первом запуске PostgreSQL контейнера

-- Создаем базу данных если она не существует
SELECT 'CREATE DATABASE auth_backend'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_backend')\gexec

-- Подключаемся к созданной базе данных
\c auth_backend;

-- Создаем расширения если нужно
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Создаем таблицу пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создаем индекс для быстрого поиска по email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Создаем индекс для быстрого поиска по username (если есть)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Создаем функцию для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Выводим информацию о созданных таблицах
\dt 
