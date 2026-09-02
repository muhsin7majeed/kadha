import type { MediaType, PaginationMeta } from '@/types/common';
import type { MovieWithMeta, TvWithMeta } from '@/features/media/media.types';

export interface RecommendationSettings {
  useLiked: boolean;
  useRatings: boolean;
  useWatched: boolean;
  useRewatchHistory: boolean;
  useWatchlist: boolean;
  excludeWatched: boolean;
}

export type RecommendationFeedbackType = 'MORE_LIKE_THIS' | 'LESS_LIKE_THIS' | 'HIDE';

export interface RecommendationReason {
  type: 'genre' | 'language' | 'decade' | 'rating' | 'liked' | 'rewatch' | 'feedback' | 'popularity';
  label: string;
  score: number;
}

export interface RecommendationItem {
  media: MovieWithMeta | TvWithMeta;
  score: number;
  reasons: RecommendationReason[];
}

export interface RecommendationResponse {
  items: RecommendationItem[];
  status: 'READY' | 'NO_SIGNALS' | 'NO_RESULTS';
  settings: RecommendationSettings;
  signalCounts: {
    liked: number;
    rated: number;
    watched: number;
    rewatched: number;
    watchlisted: number;
  };
}

export interface RecommendationListResponse {
  data: RecommendationResponse;
  pagination: PaginationMeta;
}

export interface RecommendationFeedbackPayload {
  media_id: number;
  media_type: MediaType;
  type: RecommendationFeedbackType;
  title?: string;
  original_title?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  popularity?: number | null;
  adult?: boolean;
  genre_ids?: number[];
  release_date?: string;
  original_language?: string | null;
  runtime?: number | null;
  status?: string | null;
}
