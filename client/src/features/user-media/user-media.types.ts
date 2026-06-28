import { MediaMeta, MediaType } from '@/types/common';

export interface UserMedia extends MediaMeta {
  /**
   * The ID of the user media table item in the database
   */
  id?: number;
  /**
   * Actual ID of the media in the TMDB database
   */
  media_id: number;
  media_type: MediaType;
  title: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  genre_ids: number[];
  release_date: string;
}

export type UserMediaPayload = Omit<UserMedia, 'id'>;
