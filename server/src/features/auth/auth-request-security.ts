import { NextFunction, Request, Response } from 'express';

import { envConfig } from '@/config/env';
import { forbidden, unsupportedMediaType } from '@/lib/http';

const isStateChangingRequest = (req: Request) => !['GET', 'HEAD', 'OPTIONS'].includes(req.method);

export const validateAuthRequestOrigin = (req: Request, _res: Response, next: NextFunction) => {
  if (!isStateChangingRequest(req)) {
    return next();
  }

  const requestOrigin = req.get('Origin');
  const fetchSite = req.get('Sec-Fetch-Site')?.toLowerCase();

  if (!requestOrigin) {
    if (fetchSite === 'cross-site') {
      return next(forbidden('Cross-site authentication requests are not allowed'));
    }
    return next();
  }

  try {
    if (new URL(requestOrigin).origin !== envConfig.clientOrigin) {
      return next(forbidden('Request origin is not allowed'));
    }
  } catch {
    return next(forbidden('Request origin is not allowed'));
  }

  return next();
};

export const requireJsonAuthRequest = (req: Request, _res: Response, next: NextFunction) => {
  if (!isStateChangingRequest(req) || req.is('application/json')) {
    return next();
  }

  return next(unsupportedMediaType('Authentication requests require application/json'));
};
