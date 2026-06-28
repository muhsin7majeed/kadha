import { Request, Response } from 'express';

import { getPaginationParams } from '@/lib/pagination';
import {
  getUnreadNotificationsCount,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './notification.service';

export const getNotifications = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const { page, limit } = getPaginationParams(req.query);
  const data = await getUserNotifications(currentUserId, page, limit);

  res.json(data);
};

export const getUnreadCount = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const count = await getUnreadNotificationsCount(currentUserId);

  res.json({ data: { count } });
};

export const markAsRead = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const { id: notificationId } = req.params;
  const didUpdate = await markNotificationRead(currentUserId, notificationId);

  if (!didUpdate) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  res.json({ message: 'Notification marked as read' });
};

export const markAllAsRead = async (req: Request, res: Response) => {
  const { id: currentUserId } = req.user;
  const count = await markAllNotificationsRead(currentUserId);

  res.json({ data: { count } });
};
