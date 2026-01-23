import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);

  // Handle Prisma validation errors
  if (err.code === 'P2002') {
    return res.status(400).json({ message: 'Unique constraint violation', field: err.meta?.target });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found' });
  }

  const statusCode = err.status || 500;
  const message = err.message || 'Something went wrong';

  res.status(statusCode).json({ message });
};
