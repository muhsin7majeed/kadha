import { Request, Response } from 'express';

import { getUserNotifications } from './notification.service';

export const getNotifications = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const data = await getUserNotifications(currentUserId);

  res.json({ data });
};
