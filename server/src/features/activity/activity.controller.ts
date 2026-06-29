import { Request, Response } from 'express';

import { sendResponse } from '@/lib/http';
import { getPaginationParams } from '@/lib/pagination';
import { requireAuthUser } from '@/middlewares/auth';
import { getUserActivity } from './activity.service';

export const getCurrentUserActivity = async (req: Request, res: Response) => {
  const { id } = requireAuthUser(req);
  const { page, limit } = getPaginationParams(req.query);
  const data = await getUserActivity(id, page, limit);

  sendResponse(res, data);
};
