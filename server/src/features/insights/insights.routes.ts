import { Router } from 'express';

import { getMyViewingInsights } from './insights.controller';

const router = Router();

router.get('/', getMyViewingInsights);

export default router;
