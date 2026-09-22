import { Router } from 'express';

import { getUsage } from './provider-usage.controller';

const router = Router();

router.get('/provider-usage', getUsage);

export default router;
