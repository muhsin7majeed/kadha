import { Request, Response } from 'express';

import { badRequest, getRouteParam, sendResponse } from '@/lib/http';
import { getPaginationParams } from '@/lib/pagination';
import { requireAuthUser } from '@/middlewares/auth';
import { getAdminOverview } from './admin.dashboard.service';
import { adminUsersQuerySchema, updateAdminUserRoleSchema } from './admin.schema';
import { getAdminUser, getAdminUsers, updateAdminUserRole } from './admin.service';

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
  const data = await getAdminUser(getRouteParam(req, 'id'));

  sendResponse(res, { data });
};

export const updateUserRole = async (req: Request, res: Response) => {
  const parsedBody = updateAdminUserRoleSchema.safeParse(req.body);

  if (!parsedBody.success) {
    throw badRequest('Validation failed');
  }

  const { id: actorId } = requireAuthUser(req);
  const data = await updateAdminUserRole(actorId, getRouteParam(req, 'id'), parsedBody.data.role);

  sendResponse(res, { data });
};
