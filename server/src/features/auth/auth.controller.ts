import { Request, Response } from 'express';

import { LoginAndRegisterBody } from './auth.schema';
import { loginUser, refreshAccessToken, registerUser } from './auth.service';

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req: Request<{}, {}, LoginAndRegisterBody>, res: Response) => {
  const result = await registerUser(req.body);

  if ('fieldErrors' in result) {
    return res.status(400).json({ fieldErrors: result.fieldErrors });
  }

  setRefreshTokenCookie(res, result.refreshToken);

  res.json({
    message: 'User registered successfully',
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    userId: result.userId,
  });
};

export const login = async (req: Request<{}, {}, LoginAndRegisterBody>, res: Response) => {
  const result = await loginUser(req.body);

  if (!result) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  setRefreshTokenCookie(res, result.refreshToken);

  res.json({
    message: 'User logged in successfully',
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    userId: result.userId,
  });
};

export const refresh = async (req: Request, res: Response) => {
  if (!req.cookies?.jwt) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const accessToken = refreshAccessToken(req.cookies.jwt);

    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('jwt');
  res.json({ message: 'User logged out successfully' });
};
