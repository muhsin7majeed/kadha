import { Router } from 'express';

import { getMyNavigationPreferences, updateMyNavigationPreferences } from './navigation-preferences.controller';

const router = Router();

router.get('/', getMyNavigationPreferences);
router.put('/', updateMyNavigationPreferences);

export default router;
