import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import type { LoginApiResponse, MeApiResponse, RegisterApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4002/api';

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private processQueue(error: unknown, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private setupInterceptors() {
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;
        const status = error.response?.status;

        const skipRefreshUrls = ['/auth/login', '/auth/register', '/auth/refresh'];
        const requestUrl = originalRequest?.url || '';

        if (
          status === 401 &&
          !originalRequest._retry &&
          !skipRefreshUrls.some((url) => requestUrl.includes(url))
        ) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.api(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            console.log('Attempting to refresh tokens...');
            await this.api.post('/auth/refresh');
            console.log('Tokens refreshed successfully');

            this.processQueue(null, 'token');
            this.isRefreshing = false;

            return this.api(originalRequest);
          } catch (refreshError) {
            console.log('Token refresh failed:', refreshError);
            this.processQueue(refreshError, null);
            this.isRefreshing = false;

            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  async login(email: string, password: string): Promise<LoginApiResponse> {
    const response = await this.api.post<LoginApiResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async register(email: string, password: string): Promise<RegisterApiResponse> {
    const response = await this.api.post<RegisterApiResponse>('/auth/register', {
      email,
      password,
    });
    return response.data;
  }

  async getProfile(): Promise<MeApiResponse> {
    const response = await this.api.get<MeApiResponse>('/auth/me');
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    console.log('changePassword called with:', { currentPassword: '***', newPassword: '***' });
    const response = await this.api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    console.log('changePassword response:', response.data);
  }
}

export const apiService = new ApiService();
