import { Request, Response } from 'express';
import userModel from '@/models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { envConfig } from '@/config/env';

interface LoginAndRegisterBody {
  username: string;
  password: string;
}

const ACCESS_TOKEN_EXPIRATION = '10m';
const REFRESH_TOKEN_EXPIRATION = '1d';

const getTokens = (username: string, userId: string) => {
  const accessToken = jwt.sign({ username, userId }, envConfig.jwtAccessSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });
  const refreshToken = jwt.sign({ username, userId }, envConfig.jwtRefreshSecret, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });

  return { accessToken, refreshToken };
};

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req: Request<{}, {}, LoginAndRegisterBody>, res: Response) => {
  const { username, password } = req.body;

  const user = await userModel.findOne({ username });

  if (user) {
    return res.status(400).json({ fieldErrors: { username: 'Username already exists' } });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userModel.create({
    username,
    password: hashedPassword,
  });

  const { accessToken, refreshToken } = getTokens(newUser.username, newUser._id.toString());

  setRefreshTokenCookie(res, refreshToken);

  res.json({
    message: 'User registered successfully',
    accessToken,
    refreshToken,
    userId: newUser._id,
  });
};

export const login = async (req: Request<{}, {}, LoginAndRegisterBody>, res: Response) => {
  const { username, password } = req.body;

  console.log('username', username);

  const user = await userModel.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  const { accessToken, refreshToken } = getTokens(user.username, user._id.toString());

  setRefreshTokenCookie(res, refreshToken);

  res.json({
    message: 'User logged in successfully',
    accessToken,
    refreshToken,
    userId: user._id,
  });
};

export const refresh = async (req: Request, res: Response) => {
  console.log("REFRESH", req.cookies);
  console.log("JWT", req.cookies.jwt);

  if (req.cookies?.jwt) {
    const refreshToken = req.cookies.jwt;

    jwt.verify(refreshToken, envConfig.jwtRefreshSecret, (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      } else {
        const accessToken = jwt.sign(
          { username: decoded.username, userId: decoded.userId },
          envConfig.jwtAccessSecret,
          {
            expiresIn: ACCESS_TOKEN_EXPIRATION,
          },
        );

        return res.json({ accessToken });
      }
    });
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};


export const logout = async (req: Request, res: Response) => {
  res.clearCookie('jwt');
  res.json({ message: 'User logged out successfully' });
};