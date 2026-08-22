interface TMDBBaseMedia {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
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

export type MediaType = 'movie' | 'tv';

export type NormalizedTMDBMovie = TMDBMovie & { media_type: 'movie' };
export type NormalizedTMDBTv = TMDBTv & { media_type: 'tv' };
export type NormalizedTMDBMedia = NormalizedTMDBMovie | NormalizedTMDBTv;

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

export interface TMDBCreditPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
}

export interface TMDBMovieCastCredit extends TMDBCreditPerson {
  cast_id?: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface TMDBMovieCrewCredit extends TMDBCreditPerson {
  credit_id: string;
  department: string;
  job: string;
}

export interface TMDBMovieCredits {
  id: number;
  cast: TMDBMovieCastCredit[];
  crew: TMDBMovieCrewCredit[];
}

export interface TMDBTvAggregateCastRole {
  credit_id: string;
  character: string;
  episode_count: number;
}

export interface TMDBTvAggregateCrewJob {
  credit_id: string;
  job: string;
  episode_count: number;
}

export interface TMDBTvAggregateCastCredit extends TMDBCreditPerson {
  order: number;
  roles: TMDBTvAggregateCastRole[];
  total_episode_count: number;
}

export interface TMDBTvAggregateCrewCredit extends TMDBCreditPerson {
  department: string;
  jobs: TMDBTvAggregateCrewJob[];
  total_episode_count: number;
}

export interface TMDBTvAggregateCredits {
  id: number;
  cast: TMDBTvAggregateCastCredit[];
  crew: TMDBTvAggregateCrewCredit[];
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

export interface TMDBTvSeasonEpisode {
  air_date: string | null;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  runtime: number | null;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}

export interface TMDBTvSeasonDetails {
  air_date: string | null;
  episodes: TMDBTvSeasonEpisode[];
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
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
  still_path: string | null;
}

interface MovieDBBaseResponse {
  page: number;
  total_pages: number;
  total_results: number;
}

export interface MovieDBMovieResponse extends MovieDBBaseResponse {
  results: TMDBMovie[];
}

export interface MovieDBTvResponse extends MovieDBBaseResponse {
  results: TMDBTv[];
}

export interface MovieDBGenreResponse {
  genres: TMDBGenre[];
}

export interface TMDBWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

export interface TMDBWatchProviderRegion {
  link?: string;
  flatrate?: TMDBWatchProvider[];
  rent?: TMDBWatchProvider[];
  buy?: TMDBWatchProvider[];
  ads?: TMDBWatchProvider[];
  free?: TMDBWatchProvider[];
}

export interface TMDBWatchProvidersResponse {
  id: number;
  results: Record<string, TMDBWatchProviderRegion>;
}

export interface WatchProvider {
  id: number;
  name: string;
  logoUrl: string | null;
  displayPriority: number;
}

export interface WatchProvidersResponse {
  region: {
    code: string;
    name: string;
  };
  link: string | null;
  providers: {
    stream: WatchProvider[];
    rent: WatchProvider[];
    buy: WatchProvider[];
    free: WatchProvider[];
    ads: WatchProvider[];
  };
  attribution: {
    provider: 'JustWatch';
  };
}

export interface MediaMeta {
  liked?: boolean;
  watched?: boolean;
  watchlist?: boolean;
  rating?: number | null;
  ratedAt?: Date | string | null;
  watchedOn?: string | null;
  likedNote?: string | null;
  watchedNote?: string | null;
  watchlistNote?: string | null;
  watchCount?: number;
}

export type TMDBMovieWithMediaId = Omit<NormalizedTMDBMovie, 'id'> & {
  media_id: number;
};
export type TMDBTvWithMediaId = Omit<NormalizedTMDBTv, 'id'> & {
  media_id: number;
};

export type TMDBMovieWithMeta = TMDBMovieWithMediaId & MediaMeta;
export type TMDBTvWithMeta = TMDBTvWithMediaId & MediaMeta;

export type TMDBMovieDetailsWithMediaId = Omit<TMDBMovieDetails, 'id'> & {
  media_id: number;
  media_type: 'movie';
};
export type TMDBTvDetailsWithMediaId = Omit<TMDBTvDetails, 'id'> & {
  media_id: number;
  media_type: 'tv';
};

export type TMDBMovieDetailsWithMeta = TMDBMovieDetailsWithMediaId & MediaMeta;
export type TMDBTvDetailsWithMeta = TMDBTvDetailsWithMediaId & MediaMeta;
