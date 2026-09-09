import { Request, Response } from 'express';

import { badRequest, sendData } from '@/lib/http';
import { requireAuthUser } from '@/middlewares/auth';
import { navigationPreferencesSchema } from './navigation-preferences.schema';
import { getNavigationPreferences, updateNavigationPreferences } from './navigation-preferences.service';

export const getMyNavigationPreferences = async (req: Request, res: Response) => {
  sendData(res, await getNavigationPreferences(requireAuthUser(req).id));
};

export const updateMyNavigationPreferences = async (req: Request, res: Response) => {
  const payload = navigationPreferencesSchema.safeParse(req.body);
  if (!payload.success) {
    throw badRequest('Navigation preferences are invalid');
  }

  sendData(res, await updateNavigationPreferences(requireAuthUser(req).id, payload.data));
};
