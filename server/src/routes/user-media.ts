import { addToLiked, addToWatched, addToWatchlist } from '@/controllers/user-media';
import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import userMediaSchema from '@/schemas/userMediaSchema';

const router = Router();

router.post('/liked', validate(userMediaSchema), addToLiked);
router.post('/watchlist', validate(userMediaSchema), addToWatchlist);
router.post('/watched', validate(userMediaSchema), addToWatched);

export default router;
