import { Request, Response } from 'express';

import { notFound, sendData, sendMessage, sendResponse } from '@/lib/http';
import { getPaginationParams } from '@/lib/pagination';
import { requireAuthUser } from '@/middlewares/auth';
import {
  getUnreadNotificationsCount,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './notification.service';

export const getNotifications = async (req: Request, res: Response) => {
  const { id: currentUserId } = requireAuthUser(req);
  const { page, limit } = getPaginationParams(req.query);
  const data = await getUserNotifications(currentUserId, page, limit);

  sendResponse(res, data);
};

export const getUnreadCount = async (req: Request, res: Response) => {
  const { id: currentUserId } = requireAuthUser(req);
  const count = await getUnreadNotificationsCount(currentUserId);

  sendData(res, { count });
};

export const markAsRead = async (req: Request, res: Response) => {
  const { id: currentUserId } = requireAuthUser(req);
  const { id: notificationId } = req.params;
  const didUpdate = await markNotificationRead(currentUserId, notificationId);

  if (!didUpdate) {
    throw notFound('Notification not found');
  }

  sendMessage(res, 'Notification marked as read');
};

export const markAllAsRead = async (req: Request, res: Response) => {
  const { id: currentUserId } = requireAuthUser(req);
  const count = await markAllNotificationsRead(currentUserId);

  sendData(res, { count });
};
