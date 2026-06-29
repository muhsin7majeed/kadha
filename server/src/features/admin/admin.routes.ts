import { Router } from 'express';

import { getOverview, getUser, getUsers } from './admin.controller';

const router = Router();

router.get('/overview', getOverview);
router.get('/users', getUsers);
router.get('/users/:id', getUser);

export default router;
