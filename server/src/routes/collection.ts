import {
  getCollections,
  createCollection,
  getCollection,
  updateCollection,
  deleteCollection,
  toggleCollectionItem,
} from '@/controllers/collection';
import { Router } from 'express';
import { createCollectionSchema, getCollectionsSchema, toggleCollectionSchema } from '@/schemas/collectionSchema';
import { validate } from '@/middlewares/validate';

const router = Router();

router.get('/', validate(getCollectionsSchema), getCollections);
router.post('/', validate(createCollectionSchema), createCollection);
router.get('/:id', getCollection);
router.put('/:id', validate(createCollectionSchema), updateCollection);
router.delete('/:id', deleteCollection);

router.post('/:id/items', validate(toggleCollectionSchema), toggleCollectionItem);

export default router;
