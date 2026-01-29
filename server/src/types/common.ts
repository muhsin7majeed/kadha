export interface BaseResponse<T> {
  data: T;
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
}
