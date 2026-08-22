import { Request, Response } from 'express';

import { badRequest, sendData } from '@/lib/http';
import { requireAuthUser } from '@/middlewares/auth';
import { insightsQuerySchema } from './insights.schema';
import { getViewingInsights } from './insights.service';

export const getMyViewingInsights = async (req: Request, res: Response) => {
  const query = insightsQuerySchema.safeParse(req.query);

  if (!query.success) {
    throw badRequest('Media type must be all, movie, or tv');
  }

  const data = await getViewingInsights(requireAuthUser(req).id, query.data.mediaType);
  sendData(res, data);
};
