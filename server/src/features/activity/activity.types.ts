import { MediaType, UserActivityType } from '@prisma/client';

export interface ActivityMetadata {
  title?: string | null;
  poster_path?: string | null;
  collectionName?: string | null;
  collectionDescription?: string | null;
  collectionPrivacy?: string | null;
}

export interface CreateUserActivityInput {
  userId: string;
  type: UserActivityType;
  media_id?: number;
  media_type?: MediaType;
  collectionId?: string;
  metadata?: ActivityMetadata;
}
