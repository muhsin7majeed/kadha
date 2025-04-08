import axios from 'axios';
import { getStoredToken, removeStoredToken } from '@/lib/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token && config.headers) {
      config.headers.Authorization = token;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      removeStoredToken();
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  },
);

export default api;
