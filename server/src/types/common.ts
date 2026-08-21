export interface BaseResponse<T> {
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> extends BaseResponse<T> {
  pagination: PaginationMeta;
}

export type LockedReason = 'PRIVATE' | 'FRIENDS_ONLY';

export interface ResourceAccess {
  canView: boolean;
  lockedReason?: LockedReason;
}

export interface ResourceAccessResponse<T> extends BaseResponse<T> {
  access: ResourceAccess;
}

export enum MediaType {
  Movie = 'movie',
  Tv = 'tv',
}

export enum DataPrivacy {
  OnlyMe = 'ONLY_ME',
  Friends = 'FRIENDS',
  Everyone = 'EVERYONE',
}

export enum NotificationType {
  FriendRequestReceived = 'FRIEND_REQUEST_RECEIVED',
  FriendRequestAccepted = 'FRIEND_REQUEST_ACCEPTED',
  CollectionInvite = 'COLLECTION_INVITE',
  CollectionOwnershipReceived = 'COLLECTION_OWNERSHIP_RECEIVED',
  CollectionOwnershipChanged = 'COLLECTION_OWNERSHIP_CHANGED',
  SharedCollectionsRemoved = 'SHARED_COLLECTIONS_REMOVED',
  CollectionCollaboratorDeparted = 'COLLECTION_COLLABORATOR_DEPARTED',
}
