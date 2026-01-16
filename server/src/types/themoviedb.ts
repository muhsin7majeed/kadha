interface TMDBBaseMedia {
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

export interface TMDBMovie extends TMDBBaseMedia {
  media_type?: 'movie';
  original_title: string;
  release_date: string;
  title: string;
  video: boolean;
}

export interface TMDBTv extends TMDBBaseMedia {
  media_type?: 'tv';
  original_name: string;
  first_air_date: string;
  name: string;
  origin_country?: string[];
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBNetwork {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TMDBCreatedBy {
  id: number;
  credit_id: string;
  name: string;
  gender: number;
  profile_path: string | null;
}

export interface TMDBLastEpisodeToAir {
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

export interface TMDBSeason {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

export interface TMDBMovieDetails extends Omit<TMDBMovie, 'genre_ids'> {
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  budget: number;
  genres: TMDBGenre[];
  homepage: string | null;
  imdb_id: string | null;
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  revenue: number;
  runtime: number | null;
  spoken_languages: TMDBSpokenLanguage[];
  status: string;
  tagline: string | null;
}

export interface TMDBTvDetails extends Omit<TMDBTv, 'genre_ids'> {
  created_by: TMDBCreatedBy[];
  episode_run_time: number[];
  genres: TMDBGenre[];
  homepage: string | null;
  in_production: boolean;
  languages: string[];
  last_air_date: string | null;
  last_episode_to_air: TMDBLastEpisodeToAir | null;
  next_episode_to_air: TMDBLastEpisodeToAir | null;
  networks: TMDBNetwork[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  seasons: TMDBSeason[];
  spoken_languages: TMDBSpokenLanguage[];
  status: string;
  tagline: string | null;
  type: string;
  still_path: string;
}

export interface MovieDBResponse {
  page: number;
  results: TMDBMovie[] | TMDBTv[];
  total_pages: number;
  total_results: number;
}

export interface MovieDBGenreResponse {
  genres: TMDBGenre[];
}
