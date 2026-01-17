interface MediaMeta {
  liked?: boolean;
  watched?: boolean;
  watchlist?: boolean;
}

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
  media_type?: 'movie';
  original_title: string;
  release_date: string;
  title: string;
  video: boolean;
}

export type MovieWithMeta = Movie & MediaMeta;
export type TvWithMeta = Tv & MediaMeta;

export interface Tv extends BaseMedia {
  media_type?: 'tv';
  original_name: string;
  first_air_date: string;
  name: string;
  origin_country?: string[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface Network {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface CreatedBy {
  id: number;
  credit_id: string;
  name: string;
  gender: number;
  profile_path: string | null;
}

export interface LastEpisodeToAir {
  id: number;
  name: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  air_date: string;
  episode_number: number;
  production_code: string;
  runtime: number;
  season_number: number;
  show_id: number;
  still_path: string | null;
}

export interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface MovieDetails extends Omit<Movie, 'genre_ids'> {
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  budget: number;
  genres: Genre[];
  homepage: string | null;
  imdb_id: string | null;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  revenue: number;
  runtime: number | null;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string | null;
}

export interface TvDetails extends Omit<Tv, 'genre_ids'> {
  created_by: CreatedBy[];
  episode_run_time: number[];
  genres: Genre[];
  homepage: string | null;
  in_production: boolean;
  languages: string[];
  last_air_date: string | null;
  last_episode_to_air: LastEpisodeToAir | null;
  next_episode_to_air: LastEpisodeToAir | null;
  networks: Network[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  seasons: Season[];
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string | null;
  type: string;
  still_path: string;
}

interface MovieDBBaseResponse {
  page: number;
  total_pages: number;
  total_results: number;
}
export interface MovieDBMovieResponse extends MovieDBBaseResponse {
  results: Movie[];
}

export interface MovieDBTvResponse extends MovieDBBaseResponse {
  results: Tv[];
}

export interface MovieDBGenreResponse {
  genres: Genre[];
}
