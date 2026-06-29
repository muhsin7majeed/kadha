import { Request, Response, NextFunction } from 'express';
import { isAppError } from '@/lib/http';

interface ErrorResponse {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
}

const isLegacyHttpError = (error: unknown): error is { status: number; message: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error &&
    typeof error.status === 'number' &&
    typeof error.message === 'string'
  );
};

export const errorHandler = (err: unknown, req: Request, res: Response<ErrorResponse>, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  if (isAppError(err)) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
      ...(err.fieldErrors ? { fieldErrors: err.fieldErrors } : {}),
    });
  }

  if (isLegacyHttpError(err)) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error('Unhandled server error', err);

  return res.status(500).json({ message: 'Something went wrong' });
};
