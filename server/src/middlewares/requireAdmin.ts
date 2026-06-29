import { UserRole } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

import { forbidden, unauthorized } from '@/lib/http';
import { prisma } from '@/lib/prisma';

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(unauthorized());
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      role: true,
    },
  });

  if (!user) {
    return next(unauthorized());
  }

  if (user.role !== UserRole.ADMIN) {
    return next(forbidden());
  }

  return next();
};
