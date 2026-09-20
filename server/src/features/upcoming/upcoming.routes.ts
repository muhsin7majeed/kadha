import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import { getUpcoming } from './upcoming.controller';
import { upcomingQuerySchema } from './upcoming.schema';

const router = Router();

router.get('/', validate(upcomingQuerySchema, 'query'), getUpcoming);

export default router;
