import { MediaMeta, MediaType } from '@/types/common';

export type MediaAction = 'liked' | 'watched' | 'watchlist';

export interface UserMedia extends MediaMeta {
  /**
   * The ID of the user media table item in the database
   */
  id?: number;
  /**
   * Actual ID of the media in the TMDB database
   */
  media_id: number;
  media_type: MediaType;
  title: string;
  original_title?: string | null;
  overview?: string | null;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  vote_count: number;
  popularity?: number | null;
  adult: boolean;
  genre_ids: number[];
  release_date: string;
  original_language?: string | null;
  runtime?: number | null;
  status?: string | null;
  likedAt?: string | null;
  watchedAt?: string | null;
  watchlistAt?: string | null;
}

export type UserMediaPayload = Omit<UserMedia, 'id' | 'ratedAt'>;

export type TvProgressStatus = 'not_started' | 'plan_to_watch' | 'in_progress' | 'caught_up' | 'completed';

export interface TvProgressNextEpisode {
  seasonNumber: number;
  episodeNumber: number;
  episodeId: number | null;
  name: string;
  airDate: string | null;
}

export interface TvProgressSeason {
  seasonNumber: number;
  name: string;
  watchedCount: number;
  airedCount: number;
  totalCount: number;
}

export interface TvProgressEpisode {
  seasonNumber: number;
  episodeNumber: number;
  episodeId: number | null;
  name: string;
  airDate: string | null;
  watched: boolean;
  watchedAt: string | null;
  watchedOn: string | null;
  rating: number | null;
  note: string | null;
  isAired: boolean;
}

export interface TvProgressSelectedSeason {
  seasonNumber: number;
  name: string;
  episodes: TvProgressEpisode[];
}

export interface TvProgressResponse {
  status: TvProgressStatus;
  watchedEpisodeCount: number;
  totalAiredEpisodeCount: number;
  nextEpisode: TvProgressNextEpisode | null;
  seasons: TvProgressSeason[];
  selectedSeason?: TvProgressSelectedSeason;
}
