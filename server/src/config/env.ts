import dotenv from 'dotenv';
import { getAppVersion } from '../lib/app-info';

dotenv.config();

const parseTrustProxy = (value: string | undefined): boolean | number | string => {
  if (!value || value === 'false') {
    return false;
  }

  if (value === 'true') {
    return true;
  }

  const hopCount = Number(value);
  return Number.isInteger(hopCount) && hopCount >= 0 ? hopCount : value;
};

export type AuthCookieSameSite = 'strict' | 'lax' | 'none';

const parseAuthCookieSameSite = (value: string | undefined): AuthCookieSameSite => {
  const normalizedValue = value?.trim().toLowerCase() || 'strict';

  if (normalizedValue === 'strict' || normalizedValue === 'lax' || normalizedValue === 'none') {
    return normalizedValue;
  }

  throw new Error('AUTH_COOKIE_SAME_SITE must be strict, lax, or none');
};

const parseOrigin = (value: string, name: string) => {
  try {
    return new URL(value).origin;
  } catch {
    throw new Error(`${name} must be a valid absolute URL`);
  }
};

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_REFRESH_SECRET',
  'JWT_ACCESS_SECRET',
  'TMDB_API_KEY',
  'TMDB_BEARER_TOKEN',
];

// Validate environment variables at runtime
export function validateEnvVars() {
  const ERRORED_ENV_VARS: string[] = [];

  requiredEnvVars.forEach((env) => {
    if (!process.env[env]) {
      ERRORED_ENV_VARS.push(env);
    }
  });

  if (ERRORED_ENV_VARS.length > 0) {
    throw new Error(`Missing required environment variable: ${ERRORED_ENV_VARS.join(', ')}`);
  }
}

export const envConfig = {
  port: Number(process.env.PORT) || 5000,
  appName: process.env.APP_NAME || 'Kadha',
  appUrl: process.env.APP_URL || 'https://kadha.org',
  clientOrigin: parseOrigin(process.env.CLIENT_URL || 'http://localhost:3000', 'CLIENT_URL'),
  authCookieSameSite: parseAuthCookieSameSite(process.env.AUTH_COOKIE_SAME_SITE),
  trustProxy: parseTrustProxy(process.env.TRUST_PROXY),
  version: getAppVersion(),
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
  tmdbApiKey: process.env.TMDB_API_KEY || '',
  tmdbBearerToken: process.env.TMDB_BEARER_TOKEN || '',
  tmdbApiBaseUrl: process.env.TMDB_API_BASE_URL || 'https://api.themoviedb.org/3',
};
