import { Router } from 'express';
import { getMyMediaCardPreferences, updateMyMediaCardPreferences } from './media-card-preferences.controller';

const router = Router();
router.get('/', getMyMediaCardPreferences);
router.put('/', updateMyMediaCardPreferences);
export default router;
