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
  releaseDate: string;
  liked?: boolean;
  watched?: boolean;
  watchlist?: boolean;
}

export interface MediaGenre {
  id: number;
  name: string;
}
export interface MediaDetails {
  id: number;
  backDropPath: string;
  genres: MediaGenre[];
  runtime: number | null;
  tagline: string;
  overview: string;
  posterPath: string;
  voteAverage: number;
  voteCount: number;
  adult: boolean;
  title: string;
  releaseDate: string;
  firstAirDate: string;
  liked?: boolean;
  watched?: boolean;
  watchlist?: boolean;
}
