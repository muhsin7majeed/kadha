import { Router } from 'express';

import { validate } from '@/middlewares/validate';
import {
  createCollection,
  deleteCollection,
  getCollectionInvites,
  getCollection,
  getCollections,
  inviteUserToCollection,
  leaveCollection,
  removeMember,
  respondToInvite,
  revokeInvite,
  searchInviteUsers,
  toggleCollectionItem,
  updateCollection,
  updateMemberRole,
} from './collection.controller';
import {
  createCollectionInviteSchema,
  createCollectionSchema,
  getCollectionsSchema,
  respondToCollectionInviteSchema,
  searchCollectionInviteUsersSchema,
  toggleCollectionSchema,
  updateCollectionMemberSchema,
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
router.get('/:id/invites', getCollectionInvites);
router.post('/:id/invites', validate(createCollectionInviteSchema), inviteUserToCollection);
router.post('/:id/invites/:inviteId/revoke', revokeInvite);
router.patch('/:id/members/:memberId', validate(updateCollectionMemberSchema), updateMemberRole);
router.delete('/:id/members/:memberId', removeMember);
router.post('/:id/leave', leaveCollection);
router.post('/:id/items', validate(toggleCollectionSchema), toggleCollectionItem);

export default router;
