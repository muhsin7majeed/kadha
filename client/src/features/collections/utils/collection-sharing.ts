import { DataPrivacy } from '@/types/common';
import { Collection } from '../collections.types';

const privacyLabels: Record<DataPrivacy, string> = {
  [DataPrivacy.Public]: 'Public',
  [DataPrivacy.KadhaUsers]: 'Visible to Kadha users',
  [DataPrivacy.Friends]: 'Visible to friends',
  [DataPrivacy.OnlyMe]: 'Only you',
};

export const getCollectionPrivacyLabel = (privacy: DataPrivacy) => privacyLabels[privacy];

export const getSharedMemberCount = (collection: Collection) => Math.max((collection.memberCount ?? 1) - 1, 0);

export const isCollectionShared = (collection: Collection) => {
  return collection.access?.relationship === 'member' || getSharedMemberCount(collection) > 0;
};

export const getCollectionAccessLabel = (collection: Collection) => {
  if (collection.access?.relationship !== 'member') return null;

  return collection.access.role === 'editor' ? 'You can edit' : 'You can view';
};

export const getCollectionSharingLabel = (collection: Collection) => {
  if (collection.access?.relationship === 'member') {
    return collection.owner?.username ? `Created by ${collection.owner.username}` : 'Shared with you';
  }

  const sharedMemberCount = getSharedMemberCount(collection);

  if (sharedMemberCount > 0) {
    return `Shared with ${sharedMemberCount} ${sharedMemberCount === 1 ? 'person' : 'people'}`;
  }

  return null;
};
