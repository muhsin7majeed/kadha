import { Router } from 'express';

import { getCurrentUserActivity } from './activity.controller';

const router = Router();

router.get('/', getCurrentUserActivity);

export default router;
