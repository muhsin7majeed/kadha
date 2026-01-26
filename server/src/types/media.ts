import { TMDBMovie, TMDBTv, TMDBMovieDetails, TMDBTvDetails } from './themoviedb';

export interface MediaMeta {
  liked?: boolean;
  watched?: boolean;
  watchlist?: boolean;
}

// Types with media_id instead of id (for client consumption)
export type TMDBMovieWithMediaId = Omit<TMDBMovie, 'id'> & { media_id: number };
export type TMDBTvWithMediaId = Omit<TMDBTv, 'id'> & { media_id: number };

// Types with media_id and user interaction metadata
export type TMDBMovieWithMeta = TMDBMovieWithMediaId & MediaMeta;
export type TMDBTvWithMeta = TMDBTvWithMediaId & MediaMeta;

// Details types with media_id
export type TMDBMovieDetailsWithMediaId = Omit<TMDBMovieDetails, 'id'> & { media_id: number };
export type TMDBTvDetailsWithMediaId = Omit<TMDBTvDetails, 'id'> & { media_id: number };

// Details types with media_id and user interaction metadata
export type TMDBMovieDetailsWithMeta = TMDBMovieDetailsWithMediaId & MediaMeta;
export type TMDBTvDetailsWithMeta = TMDBTvDetailsWithMediaId & MediaMeta;
