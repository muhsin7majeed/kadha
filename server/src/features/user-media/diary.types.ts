import { MediaType } from '@prisma/client';

import { PaginationMeta } from '@/types/common';
import { DiaryQuery } from './diary.schema';

export interface DiaryCoverage {
  coveredEntries: number;
  totalEntries: number;
  ratio: number;
}

export interface DiaryEntry {
  id: string;
  media_id: number;
  media_type: MediaType;
  seasonNumber: number | null;
  episodeNumber: number | null;
  episodeId: number | null;
  watchedAt: string;
  watchedOn: string | null;
  rating: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  title: string;
  original_title: string | null;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number | null;
  vote_count: number | null;
  popularity: number | null;
  adult: boolean | null;
  genre_ids: number[];
  release_date: string | null;
  original_language: string | null;
  runtime: number | null;
  status: string | null;
}

export interface DiarySummary {
  totalEntries: number;
  movieWatches: number;
  episodeWatches: number;
  uniqueTitles: number;
  estimatedMinutes: number;
  runtimeCoverage: DiaryCoverage;
  dateCoverage: DiaryCoverage;
}

export interface DiaryTimelineResponse {
  data: DiaryEntry[];
  summary: DiarySummary;
  availableYears: number[];
  pagination: PaginationMeta;
}

export type DiaryTimelineQuery = DiaryQuery;
