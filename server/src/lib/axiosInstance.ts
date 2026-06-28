import { envConfig } from '@/config/env';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  timeout: 10000, // 10 seconds
});

api.interceptors.request.use(
  (config: Axios.AxiosXHRConfig<any>) => {
    const bearerToken = envConfig.tmdbBearerToken;

    config && config.headers && (config.headers.Authorization = `Bearer ${bearerToken}`);

    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    const status = error.response?.status;
    const upstreamMessage = error.response?.data?.status_message;

    if (status) {
      return Promise.reject({
        status,
        message: upstreamMessage || 'TMDB request failed',
      });
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        status: 504,
        message: 'TMDB request timed out',
      });
    }

    return Promise.reject({
      status: 502,
      message: 'Unable to reach TMDB',
    });
  },
);

export default api;
