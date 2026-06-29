import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import {
  createCollection,
  deleteCollection,
  getCollection,
  getCollections,
  toggleCollectionItem,
  updateCollection,
} from './collection.controller';
import {
  createCollectionSchema,
  getCollectionsSchema,
  toggleCollectionSchema,
  updateCollectionSchema,
} from './collection.schema';

const router = Router();

router.get('/', validate(getCollectionsSchema, 'query'), getCollections);
router.post('/', validate(createCollectionSchema), createCollection);
router.get('/:id', getCollection);
router.put('/:id', validate(updateCollectionSchema), updateCollection);
router.delete('/:id', deleteCollection);

router.post('/:id/items', validate(toggleCollectionSchema), toggleCollectionItem);

export default router;
