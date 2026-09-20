import type { Request, Response } from 'express';

import { sendData } from '@/lib/http';
import { requireAuthUser } from '@/middlewares/auth';
import { upcomingQuerySchema } from './upcoming.schema';
import { getUpcomingSchedule } from './upcoming.service';

export const getUpcoming = async (req: Request, res: Response) => {
  const query = upcomingQuerySchema.parse(req.query);
  const schedule = await getUpcomingSchedule(requireAuthUser(req).id, query);

  return sendData(res, schedule);
};
