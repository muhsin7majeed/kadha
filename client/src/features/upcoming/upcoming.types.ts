import type { MediaCardModel } from '@/features/media/media-card-model';

export interface UpcomingEpisode {
  seasonNumber: number;
  episodeNumber: number;
  episodeId: number;
  name: string;
}

export interface UpcomingMovieRelease {
  kind: 'movie-release';
  date: string;
  media: MediaCardModel;
}

export interface UpcomingEpisodeRelease {
  kind: 'episode-release';
  date: string;
  media: MediaCardModel;
  episodes: UpcomingEpisode[];
}

export type UpcomingEntry = UpcomingMovieRelease | UpcomingEpisodeRelease;

export interface UpcomingCoverage {
  trackedTitles: number;
  resolvedTitles: number;
  failedTitles: number;
}

export interface UpcomingResponse {
  entries: UpcomingEntry[];
  coverage: UpcomingCoverage;
}

export interface UpcomingRange {
  from: string;
  to: string;
}
