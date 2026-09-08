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

const isRequestTooLargeError = (error: unknown): error is { type: 'entity.too.large' } =>
  typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.too.large';

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

  if (isRequestTooLargeError(err)) {
    const isImportRequest =
      req.path === '/api/user/import' ||
      req.path.startsWith('/api/user/import/') ||
      req.path === '/api/users/import' ||
      req.path.startsWith('/api/users/import/');
    return res.status(413).json({
      message: isImportRequest ? 'This export is larger than the 10 MB import limit.' : 'Request body is too large.',
      ...(isImportRequest ? { code: 'IMPORT_FILE_TOO_LARGE' } : {}),
    });
  }

  if (isLegacyHttpError(err)) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error('Unhandled server error', err);

  return res.status(500).json({ message: 'Something went wrong' });
};
