export type TvProgressStatus = 'not_started' | 'plan_to_watch' | 'in_progress' | 'caught_up' | 'completed';

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

export interface TvProgressSeason {
  seasonNumber: number;
  name: string;
  watchedCount: number;
  airedCount: number;
  totalCount: number;
}

export interface TvProgressNextEpisode {
  seasonNumber: number;
  episodeNumber: number;
  episodeId: number | null;
  name: string;
  airDate: string | null;
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
