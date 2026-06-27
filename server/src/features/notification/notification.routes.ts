import { Router } from 'express';

import { authMiddleware } from '@/middlewares/auth';
import { getNotifications } from './notification.controller';

const router = Router();

router.get('/', authMiddleware, getNotifications);

export default router;
