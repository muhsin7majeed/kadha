import type { MediaType } from '@prisma/client';

export interface UpcomingMedia {
  media_id: number;
  media_type: MediaType;
  title: string;
  original_title: string | null;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number | null;
  adult: boolean;
  genre_ids: number[];
  release_date: string;
  original_language: string | null;
}

export interface UpcomingEpisode {
  seasonNumber: number;
  episodeNumber: number;
  episodeId: number;
  name: string;
  watched: boolean;
}

export interface UpcomingMovieRelease {
  kind: 'movie-release';
  date: string;
  media: UpcomingMedia;
  watched: boolean;
}

export interface UpcomingEpisodeRelease {
  kind: 'episode-release';
  date: string;
  media: UpcomingMedia;
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
