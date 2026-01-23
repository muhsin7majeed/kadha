import {
  getCollections,
  createCollection,
  getCollection,
  updateCollection,
  deleteCollection,
  toggleCollectionItem,
} from '@/controllers/collection';
import { Router } from 'express';
import { toggleCollectionSchema } from '@/schemas/collectionSchema';
import { validate } from '@/middlewares/validate';

const router = Router();

router.get('/', getCollections);
router.post('/', createCollection);
router.get('/:id', getCollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

router.post('/:id/items', validate(toggleCollectionSchema), toggleCollectionItem);

export default router;
