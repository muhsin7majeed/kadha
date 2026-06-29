import { MediaType } from '@/types/common';

export enum UserActivityType {
  AccountCreated = 'ACCOUNT_CREATED',
  AccountLoggedIn = 'ACCOUNT_LOGGED_IN',
  AccountLoggedOut = 'ACCOUNT_LOGGED_OUT',
  MediaLiked = 'MEDIA_LIKED',
  MediaUnliked = 'MEDIA_UNLIKED',
  MediaWatched = 'MEDIA_WATCHED',
  MediaUnwatched = 'MEDIA_UNWATCHED',
  MediaWatchlisted = 'MEDIA_WATCHLISTED',
  MediaRemovedFromWatchlist = 'MEDIA_REMOVED_FROM_WATCHLIST',
  CollectionCreated = 'COLLECTION_CREATED',
  CollectionUpdated = 'COLLECTION_UPDATED',
  CollectionDeleted = 'COLLECTION_DELETED',
  CollectionItemAdded = 'COLLECTION_ITEM_ADDED',
  CollectionItemRemoved = 'COLLECTION_ITEM_REMOVED',
  ProfileUpdated = 'PROFILE_UPDATED',
}

export interface ActivityMetadata {
  title?: string | null;
  poster_path?: string | null;
  collectionName?: string | null;
  collectionDescription?: string | null;
  collectionPrivacy?: string | null;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: UserActivityType;
  media_id: number | null;
  media_type: MediaType | null;
  collectionId: string | null;
  metadata: string | null;
  createdAt: string;
}
