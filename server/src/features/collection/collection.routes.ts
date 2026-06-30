import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import {
  createCollection,
  deleteCollection,
  getCollection,
  getCollections,
  inviteUserToCollection,
  respondToInvite,
  searchInviteUsers,
  toggleCollectionItem,
  updateCollection,
} from './collection.controller';
import {
  createCollectionInviteSchema,
  createCollectionSchema,
  getCollectionsSchema,
  respondToCollectionInviteSchema,
  searchCollectionInviteUsersSchema,
  toggleCollectionSchema,
  updateCollectionSchema,
} from './collection.schema';

const router = Router();

router.get('/', validate(getCollectionsSchema, 'query'), getCollections);
router.post('/', validate(createCollectionSchema), createCollection);
router.post('/invites/:inviteId/respond', validate(respondToCollectionInviteSchema), respondToInvite);
router.get('/:id', getCollection);
router.put('/:id', validate(updateCollectionSchema), updateCollection);
router.delete('/:id', deleteCollection);

router.get('/:id/share/users/search', validate(searchCollectionInviteUsersSchema, 'query'), searchInviteUsers);
router.post('/:id/invites', validate(createCollectionInviteSchema), inviteUserToCollection);
router.post('/:id/items', validate(toggleCollectionSchema), toggleCollectionItem);

export default router;
