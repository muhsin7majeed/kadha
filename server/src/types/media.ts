import { TMDBGenre } from './themoviedb';

export type MediaType = 'movie' | 'tv';

export interface Media {
  id: number;
  posterPath: string;
  voteAverage: number;
  voteCount: number;
  adult: boolean;
  genreIds: number[];
  mediaType: MediaType;
  title: string;
  releaseDate: string | undefined;
  firstAirDate: string | undefined;
}

export interface MediaDetails extends Omit<Media, 'genreIds'> {
  backDropPath: string;
  genres: TMDBGenre[];
  runtime: number | null;
  tagline: string | null;
  overview: string;
}
