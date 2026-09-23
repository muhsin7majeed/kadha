import { Request, Response } from 'express';

import { badRequest, sendData } from '@/lib/http';
import { requireAuthUser } from '@/middlewares/auth';
import { mediaCardPreferencesSchema } from './media-card-preferences.schema';
import { getMediaCardPreferences, updateMediaCardPreferences } from './media-card-preferences.service';

export const getMyMediaCardPreferences = async (req: Request, res: Response) => {
  sendData(res, await getMediaCardPreferences(requireAuthUser(req).id));
};

export const updateMyMediaCardPreferences = async (req: Request, res: Response) => {
  const payload = mediaCardPreferencesSchema.safeParse(req.body);
  if (!payload.success) throw badRequest('Media card preferences are invalid');
  sendData(res, await updateMediaCardPreferences(requireAuthUser(req).id, payload.data));
};
