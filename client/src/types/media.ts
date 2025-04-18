interface BaseMedia {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  overview: string;
  popularity: number;
  poster_path: string;
  vote_average: number;
  vote_count: number;
}

export interface Movie extends BaseMedia {
  original_title: string;
  release_date: string;
  title: string;
  video: boolean;
}

export interface Tv extends BaseMedia {
  original_name: string;
  first_air_date: string;
  name: string;
}

export type MediaType = 'All' | 'Movie' | 'TV';

export interface MediaGenre {
  id: number;
  name: string;
}

interface MediaCollection {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
}

interface MediaProductionCompany {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
}

interface MediaProductionCountry {
  iso_3166_1: string;
  name: string;
}

interface MediaSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface MediaDetails {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: MediaCollection;
  budget: number;
  genres: MediaGenre[];
  homepage: string;
  id: number;
  imdb_id: string;
  origin_country: string[];
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  production_companies: MediaProductionCompany[];
  production_countries: MediaProductionCountry[];
  release_date: string;
  revenue: number;
  runtime: number;
  spoken_languages: MediaSpokenLanguage[];
  status: string;
  tagline: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}
