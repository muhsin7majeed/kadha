import MEDIA from '@/constants/media';

export interface GenericLabelValue<T = string> {
  label: string;
  value: T;
}

export interface LocationState {
  from?: {
    pathname: string;
  };
}

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

export interface BaseInfoResponse {
  message: string;
}

export type MediaTypeFilter = (typeof MEDIA.MEDIA_TYPE_FILTER)[keyof typeof MEDIA.MEDIA_TYPE_FILTER];

export type MediaType = 'movie' | 'tv';

export interface MediaMeta {
  liked?: boolean;
  watched?: boolean;
  watchlist?: boolean;
}

export enum DataPrivacy {
  Everyone = 'EVERYONE',
  Friends = 'FRIENDS',
  OnlyMe = 'ONLY_ME',
}

export enum FriendStatus {
  None = 'NONE',
  PendingSent = 'PENDING_SENT',
  PendingReceived = 'PENDING_RECEIVED',
  Accepted = 'ACCEPTED',
  BlockedByMe = 'BLOCKED_BY_ME',
  BlockedMe = 'BLOCKED_ME',
}
