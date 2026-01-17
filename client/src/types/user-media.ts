import { MediaMeta, MediaType } from './common';

export interface UserMedia extends MediaMeta {
  id: number;
  media_type: MediaType;
  title: string;
  poster_path: string;
  vote_average: number;
  vote_count: number;
  adult: boolean;
  genre_ids: number[];
  release_date: string;
}
