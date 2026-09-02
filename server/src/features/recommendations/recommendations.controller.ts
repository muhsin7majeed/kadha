import { Request, Response } from 'express';

import { badRequest, sendData, sendResponse } from '@/lib/http';
import { requireAuthUser } from '@/middlewares/auth';
import {
  recommendationFeedbackSchema,
  recommendationsQuerySchema,
  recommendationSettingsSchema,
} from './recommendations.schema';
import {
  getRecommendations,
  getRecommendationSettings,
  resetRecommendationFeedback,
  resetRecommendationSettings,
  saveRecommendationFeedback,
  updateRecommendationSettings,
} from './recommendations.service';

export const getMyRecommendations = async (req: Request, res: Response) => {
  const query = recommendationsQuerySchema.safeParse(req.query);

  if (!query.success) {
    throw badRequest('Recommendation pagination must be valid');
  }

  const result = await getRecommendations(requireAuthUser(req).id, query.data.page, query.data.limit);
  sendResponse(res, result);
};

export const getMyRecommendationSettings = async (req: Request, res: Response) => {
  const settings = await getRecommendationSettings(requireAuthUser(req).id);
  sendData(res, settings);
};

export const updateMyRecommendationSettings = async (req: Request, res: Response) => {
  const payload = recommendationSettingsSchema.safeParse(req.body);

  if (!payload.success) {
    throw badRequest('Recommendation settings are invalid');
  }

  const settings = await updateRecommendationSettings(requireAuthUser(req).id, payload.data);
  sendData(res, settings);
};

export const resetMyRecommendationSettings = async (req: Request, res: Response) => {
  const settings = await resetRecommendationSettings(requireAuthUser(req).id);
  sendData(res, settings);
};

export const saveMyRecommendationFeedback = async (req: Request, res: Response) => {
  const payload = recommendationFeedbackSchema.safeParse(req.body);

  if (!payload.success) {
    throw badRequest('Recommendation feedback is invalid');
  }

  const feedback = await saveRecommendationFeedback(requireAuthUser(req).id, payload.data);
  sendData(res, feedback);
};

export const resetMyRecommendationFeedback = async (req: Request, res: Response) => {
  await resetRecommendationFeedback(requireAuthUser(req).id);
  sendData(res, { reset: true });
};
