import { RecommendationFeedbackType } from '@prisma/client';

import { createPaginationMeta } from '@/lib/pagination';
import { badRequest } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { pickUserMediaTrackingDetails } from '@/features/user-media/user-media.serializer';
import { parseSnapshotGenreIds, upsertMediaSnapshot } from '@/features/media/media-snapshot.service';
import {
  fetchMediaRecommendations,
  fetchPopularMovies,
  fetchPopularTvs,
  fetchTopRatedMovies,
  fetchTopRatedTvs,
} from '@/features/media/tmdb.client';
import type { TMDBMovie, TMDBTv } from '@/features/media/media.types';
import type {
  RecommendationCandidate,
  RecommendationItem,
  RecommendationReason,
  RecommendationResponse,
  RecommendationSettingsResponse,
} from './recommendations.types';
import type { RecommendationFeedbackPayload, RecommendationSettingsPayload } from './recommendations.schema';

const DEFAULT_RECOMMENDATION_SETTINGS: RecommendationSettingsResponse = {
  useLiked: true,
  useRatings: true,
  useWatched: true,
  useRewatchHistory: true,
  useWatchlist: false,
  excludeWatched: true,
};

const MAX_SEEDS = 6;
const REWATCH_SIGNAL_CAP = 3;
const FEEDBACK_FEATURE_WEIGHT = 2;
const LESS_LIKE_THIS_FEATURE_PENALTY = -0.5;
const DIRECT_LESS_LIKE_THIS_PENALTY = -2;

const mediaKey = (mediaType: string, mediaId: number) => `${mediaType}:${mediaId}`;

const normalizeMovie = (media: TMDBMovie): RecommendationCandidate => ({
  media_id: media.id,
  media_type: 'movie',
  title: media.title,
  original_title: media.original_title,
  overview: media.overview,
  poster_path: media.poster_path,
  backdrop_path: media.backdrop_path,
  vote_average: media.vote_average,
  vote_count: media.vote_count,
  popularity: media.popularity,
  adult: media.adult,
  genre_ids: media.genre_ids,
  release_date: media.release_date,
  original_language: media.original_language,
});

const normalizeTv = (media: TMDBTv): RecommendationCandidate => ({
  media_id: media.id,
  media_type: 'tv',
  title: media.name,
  original_title: media.original_name,
  overview: media.overview,
  poster_path: media.poster_path,
  backdrop_path: media.backdrop_path,
  vote_average: media.vote_average,
  vote_count: media.vote_count,
  popularity: media.popularity,
  adult: media.adult,
  genre_ids: media.genre_ids,
  release_date: media.first_air_date,
  original_language: media.original_language,
});

const getReleaseDecade = (releaseDate: string | null | undefined) => {
  const year = Number((releaseDate ?? '').slice(0, 4));

  if (!Number.isInteger(year) || year <= 0) return null;

  return `${Math.floor(year / 10) * 10}s`;
};

const addWeight = <T>(map: Map<T, number>, key: T | null | undefined, weight: number) => {
  if (key === null || key === undefined || weight === 0) return;
  map.set(key, (map.get(key) ?? 0) + weight);
};

const toSettingsResponse = (settings: RecommendationSettingsResponse): RecommendationSettingsResponse => ({
  useLiked: settings.useLiked,
  useRatings: settings.useRatings,
  useWatched: settings.useWatched,
  useRewatchHistory: settings.useRewatchHistory,
  useWatchlist: settings.useWatchlist,
  excludeWatched: settings.excludeWatched,
});

export async function getRecommendationSettings(userId: string): Promise<RecommendationSettingsResponse> {
  const settings = await prisma.recommendationSettings.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      ...DEFAULT_RECOMMENDATION_SETTINGS,
    },
  });

  return toSettingsResponse(settings);
}

export async function updateRecommendationSettings(userId: string, payload: RecommendationSettingsPayload) {
  const settings = await prisma.recommendationSettings.upsert({
    where: { userId },
    update: payload,
    create: {
      userId,
      ...DEFAULT_RECOMMENDATION_SETTINGS,
      ...payload,
    },
  });

  return toSettingsResponse(settings);
}

export async function resetRecommendationSettings(userId: string) {
  const settings = await prisma.recommendationSettings.upsert({
    where: { userId },
    update: DEFAULT_RECOMMENDATION_SETTINGS,
    create: {
      userId,
      ...DEFAULT_RECOMMENDATION_SETTINGS,
    },
  });

  return toSettingsResponse(settings);
}

export async function resetRecommendationFeedback(userId: string) {
  await prisma.recommendationFeedback.deleteMany({
    where: { userId },
  });
}

const ensureFeedbackMediaSnapshot = async (payload: RecommendationFeedbackPayload) => {
  const existing = await prisma.mediaSnapshot.findUnique({
    where: {
      media_id_media_type: {
        media_id: payload.media_id,
        media_type: payload.media_type,
      },
    },
  });

  if (existing) return;

  if (!payload.title || payload.vote_average === undefined || payload.vote_count === undefined || payload.adult === undefined) {
    throw badRequest('Recommendation feedback requires known media metadata');
  }

  await upsertMediaSnapshot({
    media_id: payload.media_id,
    media_type: payload.media_type,
    title: payload.title,
    original_title: payload.original_title,
    overview: payload.overview,
    poster_path: payload.poster_path,
    backdrop_path: payload.backdrop_path,
    vote_average: payload.vote_average,
    vote_count: payload.vote_count,
    popularity: payload.popularity,
    adult: payload.adult,
    genre_ids: payload.genre_ids,
    release_date: payload.release_date,
    original_language: payload.original_language,
    runtime: payload.runtime,
    status: payload.status,
  });
};

export async function saveRecommendationFeedback(userId: string, payload: RecommendationFeedbackPayload) {
  await ensureFeedbackMediaSnapshot(payload);

  const feedback = await prisma.recommendationFeedback.upsert({
    where: {
      userId_media_id_media_type: {
        userId,
        media_id: payload.media_id,
        media_type: payload.media_type,
      },
    },
    update: {
      type: payload.type,
    },
    create: {
      userId,
      media_id: payload.media_id,
      media_type: payload.media_type,
      type: payload.type,
    },
  });

  return feedback;
}

const getSignalWeight = (
  row: {
    liked: boolean;
    watched: boolean;
    watchlist: boolean;
    rating: number | null;
    media_id: number;
    media_type: string;
  },
  watchCount: number,
  settings: RecommendationSettingsResponse,
) => {
  let weight = 0;

  if (settings.useLiked && row.liked) weight += 5;
  if (settings.useRatings && row.rating !== null) weight += (row.rating - 5) * 1.2;
  if (settings.useWatched && row.watched) weight += 1;
  if (settings.useWatchlist && row.watchlist) weight += 0.75;
  if (settings.useRewatchHistory && watchCount > 1) {
    weight += Math.min(watchCount - 1, REWATCH_SIGNAL_CAP) * 2;
  }

  return weight;
};

const addMediaFeatureWeights = (
  weights: {
    genres: Map<number, number>;
    languages: Map<string, number>;
    decades: Map<string, number>;
  },
  media: {
    genre_ids: string | number[] | null;
    original_language: string | null;
    release_date: string | null;
  },
  weight: number,
) => {
  for (const genreId of parseSnapshotGenreIds(media.genre_ids)) {
    addWeight(weights.genres, genreId, weight);
  }

  addWeight(weights.languages, media.original_language, weight * 0.5);
  addWeight(weights.decades, getReleaseDecade(media.release_date), weight * 0.35);
};

const getCandidateScore = (
  candidate: RecommendationCandidate,
  weights: {
    genres: Map<number, number>;
    languages: Map<string, number>;
    decades: Map<string, number>;
  },
  genreNames: Map<number, string>,
  directFeedback: RecommendationFeedbackType | undefined,
) => {
  const reasons: RecommendationReason[] = [];
  let score = 0;

  for (const genreId of candidate.genre_ids) {
    const genreScore = weights.genres.get(genreId) ?? 0;

    if (genreScore > 0) {
      reasons.push({
        type: 'genre',
        label: `Matches your ${genreNames.get(genreId) ?? `genre #${genreId}`} taste`,
        score: Number(genreScore.toFixed(2)),
      });
    }

    score += genreScore;
  }

  const languageScore = weights.languages.get(candidate.original_language ?? '') ?? 0;
  if (languageScore > 0) {
    reasons.push({ type: 'language', label: `Matches ${candidate.original_language?.toUpperCase()} language preference`, score: Number(languageScore.toFixed(2)) });
  }
  score += languageScore;

  const decade = getReleaseDecade(candidate.release_date);
  const decadeScore = decade ? (weights.decades.get(decade) ?? 0) : 0;
  if (decadeScore > 0) {
    reasons.push({ type: 'decade', label: `Matches your ${decade} viewing taste`, score: Number(decadeScore.toFixed(2)) });
  }
  score += decadeScore;

  if (directFeedback === 'MORE_LIKE_THIS') {
    score += 8;
    reasons.push({ type: 'feedback', label: 'You asked for more like this title', score: 8 });
  }

  if (directFeedback === 'LESS_LIKE_THIS') {
    score += DIRECT_LESS_LIKE_THIS_PENALTY;
  }

  const qualityScore = Math.min(candidate.vote_average, 10) * 0.4;
  const popularityScore = Math.min(candidate.popularity / 100, 1.5);
  score += qualityScore + popularityScore;

  if (qualityScore + popularityScore > 3) {
    reasons.push({
      type: 'popularity',
      label: 'Has a strong TMDB rating/popularity signal',
      score: Number((qualityScore + popularityScore).toFixed(2)),
    });
  }

  return {
    score: Number(score.toFixed(2)),
    reasons: reasons.sort((first, second) => second.score - first.score).slice(0, 4),
  };
};

const getGroupCount = (item: { _count?: true | { _all?: number } }) =>
  typeof item._count === 'object' ? (item._count._all ?? 0) : 0;

const uniqueCandidates = (candidates: RecommendationCandidate[]) => {
  const map = new Map<string, RecommendationCandidate>();

  for (const candidate of candidates) {
    map.set(mediaKey(candidate.media_type, candidate.media_id), candidate);
  }

  return Array.from(map.values());
};

const getCandidateMedia = async (seeds: { media_id: number; media_type: 'movie' | 'tv' }[]) => {
  const seededCandidates = await Promise.all(
    seeds.slice(0, MAX_SEEDS).map(async (seed) => {
      if (seed.media_type === 'movie') {
        const response = await fetchMediaRecommendations('movie', seed.media_id, 1);
        return response.results.map(normalizeMovie);
      }

      const response = await fetchMediaRecommendations('tv', seed.media_id, 1);
      return response.results.map(normalizeTv);
    }),
  );
  const [topMovies, topTvs, popularMovies, popularTvs] = await Promise.all([
    fetchTopRatedMovies(),
    fetchTopRatedTvs(),
    fetchPopularMovies(),
    fetchPopularTvs(),
  ]);

  return uniqueCandidates([
    ...seededCandidates.flat(),
    ...topMovies.results.map(normalizeMovie),
    ...topTvs.results.map(normalizeTv),
    ...popularMovies.results.map(normalizeMovie),
    ...popularTvs.results.map(normalizeTv),
  ]);
};

const enrichRecommendationItems = async (items: RecommendationItem[], userId: string): Promise<RecommendationItem[]> => {
  const mediaIds = items.map((item) => item.media.media_id);
  const mediaTypes = [...new Set(items.map((item) => item.media.media_type))];
  const [interactions, watchEventCounts] = await prisma.$transaction([
    prisma.userMedia.findMany({
      where: {
        userId,
        media_id: { in: mediaIds },
        media_type: { in: mediaTypes },
      },
    }),
    prisma.watchEvent.groupBy({
      by: ['media_id', 'media_type'],
      where: {
        userId,
        media_id: { in: mediaIds },
        media_type: { in: mediaTypes },
        seasonNumber: null,
        episodeNumber: null,
      },
      orderBy: [{ media_id: 'asc' }, { media_type: 'asc' }],
      _count: { _all: true },
    }),
  ]);
  const interactionMap = new Map(interactions.map((item) => [mediaKey(item.media_type, item.media_id), item]));
  const watchCountMap = new Map(watchEventCounts.map((item) => [mediaKey(item.media_type, item.media_id), getGroupCount(item)]));

  return items.map((item) => {
    const key = mediaKey(item.media.media_type, item.media.media_id);
    const interaction = interactionMap.get(key);

    return {
      ...item,
      media: {
        ...item.media,
        liked: interaction?.liked ?? false,
        watched: interaction?.watched ?? false,
        watchlist: interaction?.watchlist ?? false,
        watchCount: watchCountMap.get(key) ?? 0,
        ...pickUserMediaTrackingDetails(interaction),
      },
    };
  });
};

export async function getRecommendations(userId: string, page: number, limit: number) {
  const settings = await getRecommendationSettings(userId);
  const [mediaRows, watchEventCounts, feedbackRows] = await prisma.$transaction([
    prisma.userMedia.findMany({
      where: {
        userId,
        OR: [{ liked: true }, { watched: true }, { watchlist: true }, { rating: { not: null } }],
      },
      include: {
        media: true,
      },
    }),
    prisma.watchEvent.groupBy({
      by: ['media_id', 'media_type'],
      where: {
        userId,
        seasonNumber: null,
        episodeNumber: null,
      },
      orderBy: [{ media_id: 'asc' }, { media_type: 'asc' }],
      _count: { _all: true },
    }),
    prisma.recommendationFeedback.findMany({
      where: { userId },
      include: {
        media: true,
      },
    }),
  ]);
  const watchCountMap = new Map(watchEventCounts.map((item) => [mediaKey(item.media_type, item.media_id), getGroupCount(item)]));
  const feedbackMap = new Map(feedbackRows.map((item) => [mediaKey(item.media_type, item.media_id), item.type]));
  const hiddenKeys = new Set(
    feedbackRows.filter((item) => item.type === 'HIDE').map((item) => mediaKey(item.media_type, item.media_id)),
  );
  const watchedKeys = new Set(
    mediaRows.filter((item) => item.watched).map((item) => mediaKey(item.media_type, item.media_id)),
  );
  const weights = {
    genres: new Map<number, number>(),
    languages: new Map<string, number>(),
    decades: new Map<string, number>(),
  };
  const weightedSignals = mediaRows
    .map((row) => ({
      media_id: row.media_id,
      media_type: row.media_type,
      weight: getSignalWeight(row, watchCountMap.get(mediaKey(row.media_type, row.media_id)) ?? 0, settings),
      media: row.media,
    }))
    .sort((first, second) => second.weight - first.weight);
  const seeds = weightedSignals.filter((row) => row.weight > 0);

  for (const signal of weightedSignals) {
    addMediaFeatureWeights(weights, signal.media, signal.weight);
  }

  for (const feedback of feedbackRows) {
    if (feedback.type === 'MORE_LIKE_THIS') {
      addMediaFeatureWeights(weights, feedback.media, FEEDBACK_FEATURE_WEIGHT);
    }

    if (feedback.type === 'LESS_LIKE_THIS') {
      addMediaFeatureWeights(weights, feedback.media, LESS_LIKE_THIS_FEATURE_PENALTY);
    }
  }

  const signalCounts = {
    liked: mediaRows.filter((item) => item.liked).length,
    rated: mediaRows.filter((item) => item.rating !== null).length,
    watched: mediaRows.filter((item) => item.watched).length,
    rewatched: watchEventCounts.filter((item) => getGroupCount(item) > 1).length,
    watchlisted: mediaRows.filter((item) => item.watchlist).length,
  };

  if (seeds.length === 0 && feedbackRows.filter((item) => item.type !== 'HIDE').length === 0) {
    return {
      data: {
        items: [],
        status: 'NO_SIGNALS',
        settings,
        signalCounts,
      } satisfies RecommendationResponse,
      pagination: createPaginationMeta(page, limit, 0),
    };
  }

  const candidates = await getCandidateMedia(seeds);
  const candidateGenreIds = [...new Set(candidates.flatMap((candidate) => candidate.genre_ids))];
  const genres = await prisma.genre.findMany({
    where: {
      id: { in: candidateGenreIds },
    },
  });
  const genreNames = new Map(genres.map((genre) => [genre.id, genre.name]));

  const scoredItems = candidates
    .filter((candidate) => !hiddenKeys.has(mediaKey(candidate.media_type, candidate.media_id)))
    .filter((candidate) => !settings.excludeWatched || !watchedKeys.has(mediaKey(candidate.media_type, candidate.media_id)))
    .map((candidate) => {
      const { score, reasons } = getCandidateScore(
        candidate,
        weights,
        genreNames,
        feedbackMap.get(mediaKey(candidate.media_type, candidate.media_id)),
      );

      return {
        media: candidate,
        score,
        reasons,
      };
    })
    .filter((item) => item.score > 0)
    .sort((first, second) => second.score - first.score);

  const start = (page - 1) * limit;
  const paginatedItems = await enrichRecommendationItems(scoredItems.slice(start, start + limit), userId);

  return {
    data: {
      items: paginatedItems,
      status: scoredItems.length === 0 ? 'NO_RESULTS' : 'READY',
      settings,
      signalCounts,
    } satisfies RecommendationResponse,
    pagination: createPaginationMeta(page, limit, scoredItems.length),
  };
}
