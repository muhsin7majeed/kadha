import { Request, Response } from 'express';

import { badRequest, sendResponse } from '@/lib/http';
import { getPaginationParams } from '@/lib/pagination';
import { adminUsersQuerySchema } from './admin.schema';
import { getAdminOverview, getAdminUser, getAdminUsers } from './admin.service';

export const getOverview = async (req: Request, res: Response) => {
  const data = await getAdminOverview();

  sendResponse(res, { data });
};

export const getUsers = async (req: Request, res: Response) => {
  const parsedQuery = adminUsersQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    throw badRequest('Validation failed');
  }

  const { page, limit } = getPaginationParams(req.query);
  const data = await getAdminUsers({
    ...parsedQuery.data,
    page,
    limit,
  });

  sendResponse(res, data);
};

export const getUser = async (req: Request, res: Response) => {
  const data = await getAdminUser(req.params.id);

  sendResponse(res, { data });
};
