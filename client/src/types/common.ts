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
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Rejected = 'REJECTED',
  Blocked = 'BLOCKED',
}
