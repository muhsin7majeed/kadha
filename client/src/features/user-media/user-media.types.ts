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
  original_title?: string | null;
  overview?: string | null;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  vote_count: number;
  popularity?: number | null;
  adult: boolean;
  genre_ids: number[];
  release_date: string;
  original_language?: string | null;
  runtime?: number | null;
  status?: string | null;
  likedAt?: string | null;
  watchedAt?: string | null;
  watchlistAt?: string | null;
}

export type UserMediaPayload = Omit<UserMedia, 'id'>;
