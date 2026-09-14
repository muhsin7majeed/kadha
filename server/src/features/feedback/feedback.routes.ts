import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import {
  createFeedbackController,
  getAdminFeedbackController,
  getAdminFeedbackItemController,
  getUserFeedbackController,
  getUserFeedbackItemController,
  updateFeedbackController,
} from './feedback.controller';
import { adminFeedbackQuerySchema, createFeedbackSchema, updateFeedbackSchema } from './feedback.schema';

export const feedbackRoutes = Router();
feedbackRoutes.post('/', validate(createFeedbackSchema), createFeedbackController);
feedbackRoutes.get('/', getUserFeedbackController);
feedbackRoutes.get('/:id', getUserFeedbackItemController);

export const adminFeedbackRoutes = Router();
adminFeedbackRoutes.get('/', validate(adminFeedbackQuerySchema, 'query'), getAdminFeedbackController);
adminFeedbackRoutes.get('/:id', getAdminFeedbackItemController);
adminFeedbackRoutes.patch('/:id', validate(updateFeedbackSchema), updateFeedbackController);
