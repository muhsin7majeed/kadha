import { UserActor } from '@/features/user/user.types';

export enum NotificationType {
  FriendRequestReceived = 'FRIEND_REQUEST_RECEIVED',
  FriendRequestAccepted = 'FRIEND_REQUEST_ACCEPTED',
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
