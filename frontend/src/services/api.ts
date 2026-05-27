// src/services/api.ts
import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { ApiError } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor — Bearer токен
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — обработка ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;

    if (status === 401) {
      const url = (error.config?.url || '').toLowerCase();
      if (url.includes('/api/auth')) {
        return Promise.reject(new Error('Неверный логин или пароль'));
      }
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
      return Promise.reject(new Error('Сессия истекла. Пожалуйста, войдите снова.'));
    }

    if (status === 403) {
      return Promise.reject(new Error('Недостаточно прав для выполнения операции'));
    }

    const message = error.response?.data?.message 
      || error.message 
      || 'Произошла ошибка при запросе к серверу';
    
    return Promise.reject(new Error(message));
  }
);

// Утилита для форматирования дат в ISO
export const formatDateParam = (date: Date | string | undefined): string | undefined => {
  if (!date) return undefined;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
};