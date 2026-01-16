import { TMDBMediaType } from './general';

export interface UserMediaPayload {
  mediaId: number;
  mediaType: TMDBMediaType;

  liked?: boolean;
  watched?: boolean;
  watchlist?: boolean;

  title: string;
  posterPath: string;
  voteAverage: number;
  voteCount: number;
  adult: boolean;
  genreIds: number[];
  releaseDate: string;
}
