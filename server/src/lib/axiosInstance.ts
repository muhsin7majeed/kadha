import { envConfig } from '@/config/env';
import { AppError } from '@/lib/http';
import axios from 'axios';

interface TmdbAxiosError {
  response?: {
    status?: number;
    data?: {
      status_message?: string;
    };
  };
  code?: string;
}

const isTmdbAxiosError = (error: unknown): error is TmdbAxiosError => {
  return typeof error === 'object' && error !== null;
};

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  timeout: 10000, // 10 seconds
});

api.interceptors.request.use(
  (config) => {
    const bearerToken = envConfig.tmdbBearerToken;

    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${bearerToken}`;

    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!isTmdbAxiosError(error)) {
      return Promise.reject(new AppError('TMDB request failed', { statusCode: 502 }));
    }

    const status = error.response?.status;
    const upstreamMessage = error.response?.data?.status_message;

    if (status) {
      return Promise.reject(new AppError(upstreamMessage || 'TMDB request failed', { statusCode: status }));
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new AppError('TMDB request timed out', { statusCode: 504 }));
    }

    return Promise.reject(new AppError('Unable to reach TMDB', { statusCode: 502 }));
  },
);

export default api;
