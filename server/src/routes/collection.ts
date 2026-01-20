import {
  getCollections,
  createCollection,
  getCollection,
  updateCollection,
  deleteCollection,
  addItemsToCollection,
  removeItemsFromCollection,
} from '@/controllers/collection';
import { Router } from 'express';

const router = Router();

router.get('/', getCollections);
router.post('/', createCollection);
router.get('/:id', getCollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

router.post('/:id/items', addItemsToCollection);
router.delete('/:id/items', removeItemsFromCollection);

export default router;
