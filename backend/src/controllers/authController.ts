import { Response } from 'express';
import { User } from '../models/User';
import {
  IAuthenticatedRequest,
  IChangePasswordRequest,
  IChangePasswordResponse,
  IErrorResponse,
  ILoginRequest,
  ILoginResponse,
  ILogoutResponse,
  IMeResponse,
  IRefreshResponse,
  IRegisterRequest,
  IRegisterResponse,
} from '../types';
import {
  checkRefreshToken,
  generateTokens,
  removeRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';

export class AuthController {
  static async register(
    req: IAuthenticatedRequest,
    res: Response<IRegisterResponse | IErrorResponse>,
  ): Promise<void> {
    try {
      const { email, password }: IRegisterRequest = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: 'Неверные данные',
          message: 'Email и пароль обязательны',
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          error: 'Неверные данные',
          message: 'Пароль должен содержать минимум 6 символов',
        });
        return;
      }

      const user = await User.createUser(email, password);

      res.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
        user: user.toJSON(),
      });
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      res.status(400).json({
        error: 'Ошибка регистрации',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  static async login(
    req: IAuthenticatedRequest,
    res: Response<ILoginResponse | IErrorResponse>,
  ): Promise<void> {
    try {
      const { email, password }: ILoginRequest = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: 'Неверные данные',
          message: 'Email и пароль обязательны',
        });
        return;
      }

      const user = await User.findByEmail(email);
      if (!user) {
        res.status(401).json({
          error: 'Ошибка аутентификации',
          message: 'Неверный email или пароль',
        });
        return;
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        res.status(401).json({
          error: 'Ошибка аутентификации',
          message: 'Неверный email или пароль',
        });
        return;
      }

      const tokens = generateTokens(user.id);

      await saveRefreshToken(user.id, tokens.refreshToken);

      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        message: 'Успешный вход в систему',
        user: user.toJSON(),
      });
    } catch (error) {
      console.error('Ошибка при входе:', error);
      res.status(500).json({
        error: 'Ошибка сервера',
        message: 'Не удалось войти в систему',
      });
    }
  }

  static async logout(
    req: IAuthenticatedRequest,
    res: Response<ILogoutResponse | IErrorResponse>,
  ): Promise<void> {
    try {
      const userId = req.user!.userId;

      await removeRefreshToken(userId);

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.json({
        message: 'Успешный выход из системы',
      });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      res.status(500).json({
        error: 'Ошибка сервера',
        message: 'Не удалось выйти из системы',
      });
    }
  }

  static async refresh(
    req: IAuthenticatedRequest,
    res: Response<IRefreshResponse | IErrorResponse>,
  ): Promise<void> {
    try {
      const refreshToken = req.cookies['refreshToken'];

      if (!refreshToken) {
        res.status(400).json({
          error: 'Неверные данные',
          message: 'Refresh токен обязателен',
        });
        return;
      }

      const decoded = verifyRefreshToken(refreshToken);
      const userId = decoded.userId;

      const user = await User.findById(userId);
      if (!user) {
        res.status(401).json({
          error: 'Недействительный токен',
          message: 'Пользователь не найден',
        });
        return;
      }

      const isValidRefreshToken = await checkRefreshToken(userId, refreshToken);
      if (!isValidRefreshToken) {
        res.status(401).json({
          error: 'Недействительный токен',
          message: 'Refresh токен не найден или истек',
        });
        return;
      }

      const newTokens = generateTokens(userId);

      await saveRefreshToken(userId, newTokens.refreshToken);

      res.cookie('accessToken', newTokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refreshToken', newTokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        message: 'Токены успешно обновлены',
      });
    } catch (error) {
      console.error('Ошибка при обновлении токенов:', error);
      res.status(401).json({
        error: 'Ошибка обновления токенов',
        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    }
  }

  static async changePassword(
    req: IAuthenticatedRequest,
    res: Response<IChangePasswordResponse | IErrorResponse>,
  ): Promise<void> {
    try {
      const { currentPassword, newPassword }: IChangePasswordRequest = req.body;
      const userId = req.user!.userId;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          error: 'Неверные данные',
          message: 'Текущий и новый пароль обязательны',
        });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          error: 'Неверные данные',
          message: 'Новый пароль должен содержать минимум 6 символов',
        });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({
          error: 'Пользователь не найден',
          message: 'Пользователь с указанным ID не существует',
        });
        return;
      }

      const isValidCurrentPassword = await user.comparePassword(currentPassword);
      if (!isValidCurrentPassword) {
        res.status(401).json({
          error: 'Неверный пароль',
          message: 'Текущий пароль указан неверно',
        });
        return;
      }

      await user.updatePassword(newPassword);

      await removeRefreshToken(userId);

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.json({
        message: 'Пароль успешно изменен',
        note: 'Вы были автоматически выйдены со всех устройств',
      });
    } catch (error) {
      console.error('Ошибка при изменении пароля:', error);
      res.status(500).json({
        error: 'Ошибка сервера',
        message: 'Не удалось изменить пароль',
      });
    }
  }

  static async me(
    req: IAuthenticatedRequest,
    res: Response<IMeResponse | IErrorResponse>,
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          error: 'Пользователь не найден',
          message: 'Пользователь с указанным ID не существует',
        });
        return;
      }

      res.json({
        user: user.toJSON(),
      });
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      res.status(500).json({
        error: 'Ошибка сервера',
        message: 'Не удалось получить данные пользователя',
      });
    }
  }
}
