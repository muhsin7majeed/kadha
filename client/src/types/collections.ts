import { DataPrivacy } from './common';

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string;
  privacy: DataPrivacy;
  created_at: Date;
  updated_at: Date;
}
