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
