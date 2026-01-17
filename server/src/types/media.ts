import { TMDBMovie, TMDBTv } from './themoviedb';

export interface MediaMeta {
  liked?: boolean;
  watched?: boolean;
  watchlist?: boolean;
}
export type TMDBMovieWithMeta = TMDBMovie & MediaMeta;
export type TMDBTvWithMeta = TMDBTv & MediaMeta;
