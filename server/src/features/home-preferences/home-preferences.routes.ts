import { Router } from 'express';

import { getMyHomePreferences, updateMyHomePreferences } from './home-preferences.controller';

const router = Router();

router.get('/', getMyHomePreferences);
router.put('/', updateMyHomePreferences);

export default router;
