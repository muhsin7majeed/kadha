import { envConfig } from "@/config/env";
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  timeout: 10000, // 10 seconds
});

api.interceptors.request.use(
  (config: Axios.AxiosXHRConfig<any>) => {
    const bearerToken = envConfig.tmdbBearerToken;

    config &&
      config.headers &&
      (config.headers.Authorization = `Bearer ${bearerToken}`);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
