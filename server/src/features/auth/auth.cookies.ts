import { Response } from 'express';

import { envConfig } from '@/config/env';
import { REFRESH_TOKEN_EXPIRATION_SECONDS } from './auth.constants';

export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    sameSite: envConfig.authCookieSameSite,
    secure: true,
    maxAge: REFRESH_TOKEN_EXPIRATION_SECONDS * 1000,
  });
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: envConfig.authCookieSameSite,
    secure: true,
  });
};
