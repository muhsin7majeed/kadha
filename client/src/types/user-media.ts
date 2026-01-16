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

export interface UserMediaResponse {
  _id: string;
  mediaId: number;
  mediaType: TMDBMediaType;
  userId: string;
  adult: boolean;
  createdAt: string;
  genreIds: number[];
  liked: boolean;
  posterPath: string;
  releaseDate: string;
  title: string;
  updatedAt: string;
  voteAverage: number;
  voteCount: number;
  watched: boolean;
  watchlist: boolean;
}
