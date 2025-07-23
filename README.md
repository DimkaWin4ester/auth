# Система аутентификации

Полнофункциональная система аутентификации с фронтендом на React + TypeScript и бэкендом на Node.js + Express, готовная к запуску через Docker Compose.

## Технологии

### Frontend

- React 19 + TypeScript
- Ant Design (UI компоненты)
- React Hook Form (управление формами)
- React Router DOM (роутинг)
- Axios (HTTP клиент)
- Zustand (управление состоянием)
- Vite (сборщик)

### Backend

- Node.js + Express + TypeScript
- PostgreSQL + Sequelize ORM
- Redis (для refresh токенов)
- JWT (access + refresh токены)
- bcryptjs (хеширование паролей)

### Инфраструктура

- Docker & Docker Compose
- PostgreSQL (база данных)
- Redis (кэш и токены)
- Nginx (прокси для фронтенда)

## Структура проекта

```
auth/
├── frontend/          # React приложение
├── backend/           # Express API сервер
├── docker-compose.yml # Docker конфигурация
├── docker-compose.override.yml # Переопределения для разработки
└── README.md
```

## Быстрый запуск

### Предварительные требования

- Docker
- Docker Compose

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd auth
```

### 2. Запуск через Docker Compose

```bash
docker-compose up -d
```

Это запустит:

- **Frontend**: http://localhost:4001
- **Backend API**: http://localhost:4002
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 3. Проверка статуса

```bash
docker-compose ps
```

### 4. Просмотр логов

```bash
# Все сервисы
docker-compose logs

# Конкретный сервис
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres
docker-compose logs redis
```

## Разработка

### Запуск в режиме разработки

```bash
docker-compose up --build
```

Это включает:

- Hot reload для фронтенда и бэкенда
- Монтирование исходного кода
- Отладочные порты

### Остановка сервисов

```bash
docker-compose down
```

### Полная очистка

```bash
docker-compose down -v --remove-orphans
```

Это удалит все контейнеры, сети и volumes.

## API Endpoints

### Аутентификация

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/logout` - Выход из системы
- `GET /api/auth/me` - Получение профиля пользователя
- `POST /api/auth/refresh` - Обновление токенов
- `PUT /api/auth/change-password` - Смена пароля

### Защищенные маршруты

Все маршруты кроме `/login` и `/register` требуют аутентификации.

## Функциональность

### Регистрация

- Валидация email и пароля
- Хеширование паролей
- Проверка уникальности email

### Авторизация

- JWT токены (access + refresh)
- Автоматическое обновление токенов
- Защищенные маршруты
- Cookies для хранения токенов

### Личный кабинет

- Отображение информации о пользователе
- Смена пароля с валидацией
- Выход из системы
- Защищенный доступ

## Переменные окружения

Все переменные окружения уже настроены в Docker Compose файлах:

### Backend (config.env)

```
PORT=4002
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REDIS_URL=redis://redis:6379
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=auth_backend
NODE_ENV=development
```

### Frontend

```
VITE_API_URL=http://localhost:4002/api
```

## Тестирование

1. Откройте http://localhost:4001
2. Зарегистрируйтесь с новым email
3. Войдите в систему
4. Проверьте личный кабинет
5. Протестируйте смену пароля
6. Протестируйте выход из системы

## Безопасность

- Пароли хешируются с помощью bcrypt
- JWT токены с ограниченным временем жизни
- Refresh токены хранятся в Redis
- CORS настройки
- Валидация входных данных
- Защищенные маршруты
- HttpOnly cookies для токенов

## Управление данными

### Резервное копирование базы данных

```bash
docker-compose exec postgres pg_dump -U postgres auth_backend > backup.sql
```

### Восстановление базы данных

```bash
docker-compose exec -T postgres psql -U postgres auth_backend < backup.sql
```

### Очистка данных

```bash
docker-compose down -v
docker-compose up -d
```

## Мониторинг

### Проверка здоровья сервисов

```bash
# Backend health check
curl http://localhost:4002/api/health

# Frontend (через nginx)
curl http://localhost:4001
```

### Просмотр метрик

```bash
# Использование ресурсов
docker stats

# Логи в реальном времени
docker-compose logs -f
```

## Устранение неполадок

### Проблемы с подключением к базе данных

```bash
docker-compose restart backend
```

### Проблемы с Redis

```bash
docker-compose restart redis
```

### Очистка кэша Docker

```bash
docker system prune -a
```

### Пересборка образов

```bash
docker-compose build --no-cache
docker-compose up -d
```

## Разработка

### Добавление новых функций

1. Создайте новые endpoints в `backend/src/routes.ts`
2. Добавьте контроллеры в `backend/src/controllers/`
3. Обновите типы в `backend/src/types/`
4. Добавьте соответствующие компоненты на фронтенде
5. Обновите API сервис в `frontend/src/services/`

### Структура кода

- Компоненты в `frontend/src/components/`
- Страницы в `frontend/src/pages/`
- Хуки в `frontend/src/hooks/`
- Сервисы в `frontend/src/services/`
- Store в `frontend/src/store/`
- Типы в `frontend/src/types/`

### Hot Reload

При разработке изменения в коде автоматически перезагружают приложение благодаря настроенному Vite и nodemon.

## Продакшн

Для продакшн развертывания:

1. Измените переменные окружения
2. Используйте продакшн образы
3. Настройте SSL/TLS
4. Настройте мониторинг
5. Настройте бэкапы

```bash
# Продакшн сборка
docker-compose -f docker-compose.prod.yml up -d
```
