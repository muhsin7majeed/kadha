import { UserActor } from '@/types/user';

export enum NotificationType {
  FriendRequestReceived = 'FRIEND_REQUEST_RECEIVED',
  FriendRequestAccepted = 'FRIEND_REQUEST_ACCEPTED',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  read: boolean;
  actorId: string;
  referenceId: string | null;
  createdAt: string;
  actor?: UserActor;
}
