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
