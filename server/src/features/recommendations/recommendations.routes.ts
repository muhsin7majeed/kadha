import { Router } from 'express';

import {
  getMyRecommendationSettings,
  getMyRecommendations,
  resetMyRecommendationFeedback,
  resetMyRecommendationSettings,
  saveMyRecommendationFeedback,
  updateMyRecommendationSettings,
} from './recommendations.controller';

const router = Router();

router.get('/', getMyRecommendations);
router.get('/settings', getMyRecommendationSettings);
router.put('/settings', updateMyRecommendationSettings);
router.post('/settings/reset', resetMyRecommendationSettings);
router.post('/feedback', saveMyRecommendationFeedback);
router.post('/feedback/reset', resetMyRecommendationFeedback);

export default router;
