import { NextFunction, Request, Response } from 'express';

export type FieldErrors = Record<string, string>;

interface AppErrorOptions {
  statusCode?: number;
  code?: string;
  fieldErrors?: FieldErrors;
}

export class AppError extends Error {
  statusCode: number;
  code?: string;
  fieldErrors?: FieldErrors;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code;
    this.fieldErrors = options.fieldErrors;
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;

export const badRequest = (message = 'Invalid request', fieldErrors?: FieldErrors) =>
  new AppError(message, { statusCode: 400, code: 'BAD_REQUEST', fieldErrors });

export const unauthorized = (message = 'Unauthorized') =>
  new AppError(message, { statusCode: 401, code: 'UNAUTHORIZED' });

export const forbidden = (message = 'Forbidden') => new AppError(message, { statusCode: 403, code: 'FORBIDDEN' });

export const notFound = (message = 'Not found') => new AppError(message, { statusCode: 404, code: 'NOT_FOUND' });

export const sendData = <T>(res: Response, data: T, statusCode = 200) => {
  return res.status(statusCode).json({ data });
};

export const sendMessage = (res: Response, message: string, statusCode = 200) => {
  return res.status(statusCode).json({ message });
};

export const sendResponse = <T>(res: Response<T>, body: T, statusCode = 200) => {
  return res.status(statusCode).json(body);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};
