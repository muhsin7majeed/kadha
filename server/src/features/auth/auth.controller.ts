import { Request, Response } from 'express';

import { badRequest, sendMessage, sendResponse, unauthorized } from '@/lib/http';
import { requireAuthUser } from '@/middlewares/auth';
import { REFRESH_TOKEN_EXPIRATION_SECONDS } from './auth.constants';
import { LoginBody, ManageRecoveryCodeBody, RecoverAccountBody, RegisterBody } from './auth.schema';
import {
  createOrReplaceRecoveryCode,
  getRecoveryCodeStatus,
  loginUser,
  recordLogoutActivity,
  recoverUserAccount,
  refreshAccessToken,
  registerUser,
} from './auth.service';

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: REFRESH_TOKEN_EXPIRATION_SECONDS * 1000,
  });
};

const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });
};

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const result = await registerUser(req.body);

  if ('fieldErrors' in result) {
    throw badRequest('Validation failed', result.fieldErrors);
  }

  setRefreshTokenCookie(res, result.refreshToken);

  sendResponse(res, {
    message: 'User registered successfully',
    accessToken: result.accessToken,
    recoveryCode: result.recoveryCode,
    userId: result.userId,
  });
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const result = await loginUser(req.body);

  if (!result) {
    throw badRequest('Invalid username or password');
  }

  setRefreshTokenCookie(res, result.refreshToken);

  sendResponse(res, {
    message: 'User logged in successfully',
    accessToken: result.accessToken,
    userId: result.userId,
  });
};

export const refresh = async (req: Request, res: Response) => {
  if (!req.cookies?.jwt) {
    throw unauthorized();
  }

  try {
    const accessToken = await refreshAccessToken(req.cookies.jwt);

    return sendResponse(res, { accessToken });
  } catch {
    throw unauthorized();
  }
};

export const logout = async (req: Request, res: Response) => {
  await recordLogoutActivity(req.cookies?.jwt);
  clearRefreshTokenCookie(res);
  sendMessage(res, 'User logged out successfully');
};

export const getRecoveryStatus = async (req: Request, res: Response) => {
  const user = requireAuthUser(req);
  const status = await getRecoveryCodeStatus(user.id);

  sendResponse(res, status);
};

export const manageRecoveryCode = async (req: Request<{}, {}, ManageRecoveryCodeBody>, res: Response) => {
  const user = requireAuthUser(req);
  const result = await createOrReplaceRecoveryCode(user.id, req.body.currentPassword);

  if (!result) {
    throw badRequest('Invalid password');
  }

  sendResponse(res, {
    recoveryCode: result.recoveryCode,
    createdAt: result.createdAt.toISOString(),
  });
};

export const recoverAccount = async (req: Request<{}, {}, RecoverAccountBody>, res: Response) => {
  const result = await recoverUserAccount(req.body);

  if (!result) {
    throw badRequest('Invalid username or recovery code');
  }

  clearRefreshTokenCookie(res);
  sendResponse(res, {
    message: 'Password reset successfully',
    recoveryCode: result.recoveryCode,
  });
};
