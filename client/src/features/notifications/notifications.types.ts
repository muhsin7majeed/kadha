import { UserActor } from '@/features/user/user.types';

export enum NotificationType {
  FriendRequestReceived = 'FRIEND_REQUEST_RECEIVED',
  FriendRequestAccepted = 'FRIEND_REQUEST_ACCEPTED',
  CollectionInvite = 'COLLECTION_INVITE',
  CollectionOwnershipReceived = 'COLLECTION_OWNERSHIP_RECEIVED',
  CollectionOwnershipChanged = 'COLLECTION_OWNERSHIP_CHANGED',
  SharedCollectionsRemoved = 'SHARED_COLLECTIONS_REMOVED',
  CollectionCollaboratorDeparted = 'COLLECTION_COLLABORATOR_DEPARTED',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  read: boolean;
  actorId: string | null;
  referenceId: string | null;
  entityType: string | null;
  entityId: string | null;
  metadata: string | null;
  readAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  actor?: UserActor;
}

export interface UnreadNotificationsCount {
  count: number;
}
