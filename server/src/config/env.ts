import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['MONGO_URI', 'JWT_REFRESH_SECRET', 'JWT_ACCESS_SECRET', 'TMDB_API_KEY', 'TMDB_BEARER_TOKEN'];

requiredEnvVars.forEach((env) => {
  let ERRORED_ENV_VARS: string[] = [];

  if (!process.env[env]) {
    ERRORED_ENV_VARS.push(env);
  }

  if (ERRORED_ENV_VARS.length > 0) {
    throw new Error(`Missing required environment variable: ${ERRORED_ENV_VARS.join(', ')}`);
  }
});

export const envConfig = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
  tmdbApiKey: process.env.TMDB_API_KEY || '',
  tmdbBearerToken: process.env.TMDB_BEARER_TOKEN || '',
};
