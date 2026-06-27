import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import { addToLiked, addToWatched, addToWatchlist } from './user-media.controller';
import { userMediaSchema } from './user-media.schema';

const router = Router();

router.post('/liked', validate(userMediaSchema), addToLiked);
router.post('/watchlist', validate(userMediaSchema), addToWatchlist);
router.post('/watched', validate(userMediaSchema), addToWatched);

export default router;
