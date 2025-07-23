import { message } from 'antd';
import axios from 'axios';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { LoginForm, RegisterForm } from '../types';

export const useAuth = () => {
  const navigate = useNavigate();
  const { login, logout, setLoading, setError, isLoading, error } = useAuthStore();

  const handleLogin = useCallback(
    async (data: LoginForm) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.login(data.email, data.password);
        console.log('Login response:', response);

        login(response.user);

        message.success('Успешный вход в систему');
        navigate('/dashboard', { replace: true });
      } catch (err: unknown) {
        let errorMessage = 'Ошибка входа';

        if (axios.isAxiosError(err)) {
          const backendMessage = err.response?.data?.message || err.response?.data?.error;

          if (typeof backendMessage === 'string') {
            errorMessage = backendMessage;
          }

          console.log('Axios error:', err.response?.data);
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [login, navigate, setError, setLoading],
  );

  const handleRegister = useCallback(
    async (data: RegisterForm) => {
      try {
        setLoading(true);
        setError(null);

        await apiService.register(data.email, data.password);
        message.success('Регистрация прошла успешно. Теперь войдите в систему.');
        navigate('/login');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Ошибка регистрации';
        setError(errorMessage);
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [navigate, setError, setLoading],
  );

  const handleLogout = useCallback(async () => {
    try {
      await apiService.logout();
      logout();
      message.success('Вы успешно вышли из системы');
      navigate('/login');
    } catch {
      message.error('Ошибка при выходе');
      logout();
      navigate('/login');
    }
  }, [logout, navigate]);

  return {
    handleLogin,
    handleRegister,
    handleLogout,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};
