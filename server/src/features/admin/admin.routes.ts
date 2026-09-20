import { Router } from 'express';

import { getOverview, getUser, getUsers, updateUserRole } from './admin.controller';

const router = Router();

router.get('/overview', getOverview);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/users/:id', getUser);

export default router;
