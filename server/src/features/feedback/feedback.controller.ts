import type { Request, Response } from 'express';

import { sendData, sendResponse } from '@/lib/http';
import { getPaginationParams } from '@/lib/pagination';
import { requireAuthUser } from '@/middlewares/auth';
import { adminFeedbackQuerySchema, createFeedbackSchema, updateFeedbackSchema } from './feedback.schema';
import {
  createFeedback,
  getAdminFeedback,
  getAdminFeedbackItem,
  getUserFeedback,
  getUserFeedbackItem,
  updateFeedback,
} from './feedback.service';

export const createFeedbackController = async (req: Request, res: Response) => {
  const user = requireAuthUser(req);
  const data = await createFeedback(user.id, createFeedbackSchema.parse(req.body));
  sendData(res, data, 201);
};

export const getUserFeedbackController = async (req: Request, res: Response) => {
  const user = requireAuthUser(req);
  const { page, limit } = getPaginationParams(req.query);
  sendResponse(res, await getUserFeedback(user.id, page, limit));
};

export const getUserFeedbackItemController = async (req: Request, res: Response) => {
  const user = requireAuthUser(req);
  sendData(res, await getUserFeedbackItem(user.id, req.params.id));
};

export const getAdminFeedbackController = async (req: Request, res: Response) => {
  const query = adminFeedbackQuerySchema.parse(req.query);
  const { page, limit } = getPaginationParams(req.query);
  sendResponse(res, await getAdminFeedback({ ...query, page, limit }));
};

export const getAdminFeedbackItemController = async (req: Request, res: Response) => {
  sendData(res, await getAdminFeedbackItem(req.params.id));
};

export const updateFeedbackController = async (req: Request, res: Response) => {
  sendData(res, await updateFeedback(req.params.id, updateFeedbackSchema.parse(req.body)));
};
