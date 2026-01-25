import { DataPrivacy } from './common';
import { UserMedia } from './user-media';

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string;
  privacy: DataPrivacy;
  created_at: Date;
  updated_at: Date;
  hasMedia?: boolean;
}

export interface AddToCollectionPayload extends Omit<UserMedia, 'id' | 'userId'> {
  collectionId: string;
}

interface CollectionMedia extends Omit<UserMedia, 'genre_ids'> {
  collectionId: string;
  media_id: number;
  /**
   * genre_ids are array of numbers stored as string in DB
   * @example [53,18] -> "53,18"
   */
  genre_ids: string;
  created_at: Date;
}
export interface CollectionDetails extends Omit<Collection, 'hasMedia'> {
  media: CollectionMedia[];
}

export interface CollectionFormFields {
  name: string;
  description: string;
  privacy: DataPrivacy;
}
