import { RecommendationFeedbackType } from '@prisma/client';

import type { MediaMeta, MediaType } from '@/features/media/media.types';

export interface RecommendationSettingsResponse {
  useLiked: boolean;
  useRatings: boolean;
  useWatched: boolean;
  useRewatchHistory: boolean;
  useWatchlist: boolean;
  excludeWatched: boolean;
}

export type RecommendationFeedbackValue = RecommendationFeedbackType;

export interface RecommendationReason {
  type: 'genre' | 'language' | 'decade' | 'rating' | 'liked' | 'rewatch' | 'feedback' | 'popularity';
  label: string;
  score: number;
}

export type RecommendationMedia = RecommendationCandidate & MediaMeta;

export interface RecommendationItem {
  media: RecommendationMedia;
  score: number;
  reasons: RecommendationReason[];
}

export interface RecommendationResponse {
  items: RecommendationItem[];
  status: 'READY' | 'NO_SIGNALS' | 'NO_RESULTS';
  settings: RecommendationSettingsResponse;
  signalCounts: {
    liked: number;
    rated: number;
    watched: number;
    rewatched: number;
    watchlisted: number;
  };
}

export interface RecommendationCandidate {
  media_id: number;
  media_type: MediaType;
  title: string;
  original_title: string | null;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  genre_ids: number[];
  release_date: string;
  original_language: string | null;
  runtime?: number | null;
  status?: string | null;
}
