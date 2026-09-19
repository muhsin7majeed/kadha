import { Request, Response } from 'express';

import { badRequest, sendData } from '@/lib/http';
import { requireAuthUser } from '@/middlewares/auth';
import { homePreferencesSchema } from './home-preferences.schema';
import { getHomePreferences, updateHomePreferences } from './home-preferences.service';

export const getMyHomePreferences = async (req: Request, res: Response) => {
  sendData(res, await getHomePreferences(requireAuthUser(req).id));
};

export const updateMyHomePreferences = async (req: Request, res: Response) => {
  const payload = homePreferencesSchema.safeParse(req.body);
  if (!payload.success) {
    throw badRequest('Home preferences are invalid');
  }

  sendData(res, await updateHomePreferences(requireAuthUser(req).id, payload.data));
};
