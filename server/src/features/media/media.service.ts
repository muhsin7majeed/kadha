import { prisma } from '@/lib/prisma';
import { createPaginationMeta } from '@/lib/pagination';
import { badRequest } from '@/lib/http';
import { pickUserMediaTrackingDetails } from '@/features/user-media/user-media.serializer';
import {
  DEFAULT_WATCH_REGION,
  getWatchRegionName,
  isSupportedWatchRegion,
  normalizeWatchRegion,
} from '@/constants/watch-regions';

import {
  MediaType,
  NormalizedTMDBMedia,
  NormalizedTMDBMovie,
  NormalizedTMDBTv,
  TMDBMovie,
  TMDBMovieDetailsWithMeta,
  TMDBMovieWithMeta,
  TMDBTv,
  TMDBTvDetailsWithMeta,
  TMDBTvWithMeta,
  TMDBWatchProvider,
  WatchProvider,
  WatchProvidersResponse,
} from './media.types';
import {
  fetchMediaDetails,
  fetchMovieGenres,
  fetchPopularMovies,
  fetchPopularTvs,
  fetchTopRatedMovies,
  fetchTopRatedTvs,
  fetchTrendingMovies,
  fetchTrendingTvs,
  fetchTvGenres,
  fetchWatchProviders,
  searchMediaByType,
} from './tmdb.client';

const isMediaType = (value: string): value is MediaType => value === 'movie' || value === 'tv';

const parseMediaId = (value: string) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw badRequest('Media ID must be a positive integer');
  }

  return id;
};

const assertMediaType = (value: string): MediaType => {
  if (!isMediaType(value)) {
    throw badRequest('Media type must be either movie or tv');
  }

  return value;
};

const assertWatchRegion = (value: string): string => {
  const region = normalizeWatchRegion(value);

  if (!isSupportedWatchRegion(region)) {
    throw badRequest('Choose a supported country', { region: 'Choose a supported country' });
  }

  return region;
};

const normalizeMovie = (media: TMDBMovie): NormalizedTMDBMovie => ({
  ...media,
  media_type: 'movie',
});

const normalizeTv = (media: TMDBTv): NormalizedTMDBTv => ({
  ...media,
  media_type: 'tv',
});

const interactionKey = (mediaType: MediaType, mediaId: number) => `${mediaType}:${mediaId}`;

const TMDB_LOGO_BASE_URL = 'https://image.tmdb.org/t/p/w92';

const normalizeWatchProviders = (providers: TMDBWatchProvider[] = []): WatchProvider[] => {
  return [...providers]
    .sort((a, b) => a.display_priority - b.display_priority)
    .map((provider) => ({
      id: provider.provider_id,
      name: provider.provider_name,
      logoUrl: provider.logo_path ? `${TMDB_LOGO_BASE_URL}${provider.logo_path}` : null,
      displayPriority: provider.display_priority,
    }));
};

const enrichMediaWithUserInteractions = async (
  media: NormalizedTMDBMedia[],
  userId: string,
): Promise<TMDBMovieWithMeta[] | TMDBTvWithMeta[]> => {
  const mediaIds = media.map((m) => m.id);
  const mediaTypes = [...new Set(media.map((m) => m.media_type))];

  const interactions = await prisma.userMedia.findMany({
    where: {
      userId,
      media_id: { in: mediaIds },
      media_type: { in: mediaTypes },
    },
  });
  const watchEventCounts = await prisma.watchEvent.groupBy({
    by: ['media_id', 'media_type'],
    where: {
      userId,
      media_id: { in: mediaIds },
      media_type: { in: mediaTypes },
      seasonNumber: null,
      episodeNumber: null,
    },
    _count: { _all: true },
  });

  const map = new Map<string, (typeof interactions)[number]>();
  const watchCountMap = new Map(
    watchEventCounts.map((item) => [interactionKey(item.media_type, item.media_id), item._count._all]),
  );

  interactions.forEach((i) => {
    map.set(interactionKey(i.media_type, i.media_id), i);
  });

  const enriched = media.map((m) => {
    const { id, ...rest } = m;
    const interaction = map.get(interactionKey(m.media_type, id));

    return {
      ...rest,
      media_id: id,
      liked: interaction?.liked ?? false,
      watched: interaction?.watched ?? false,
      watchlist: interaction?.watchlist ?? false,
      watchCount: watchCountMap.get(interactionKey(m.media_type, id)) ?? 0,
      ...pickUserMediaTrackingDetails(interaction),
    };
  });

  return enriched as TMDBMovieWithMeta[] | TMDBTvWithMeta[];
};

export async function getTrendingMovies(userId: string) {
  const response = await fetchTrendingMovies();
  return enrichMediaWithUserInteractions(response.results.map(normalizeMovie), userId) as Promise<TMDBMovieWithMeta[]>;
}

export async function getTrendingTvs(userId: string) {
  const response = await fetchTrendingTvs();
  return enrichMediaWithUserInteractions(response.results.map(normalizeTv), userId) as Promise<TMDBTvWithMeta[]>;
}

export async function getPopularMovies(userId: string) {
  const response = await fetchPopularMovies();
  return enrichMediaWithUserInteractions(response.results.map(normalizeMovie), userId) as Promise<TMDBMovieWithMeta[]>;
}

export async function getPopularTvs(userId: string) {
  const response = await fetchPopularTvs();
  return enrichMediaWithUserInteractions(response.results.map(normalizeTv), userId) as Promise<TMDBTvWithMeta[]>;
}

export async function getTopRatedMovies(userId: string) {
  const response = await fetchTopRatedMovies();
  return enrichMediaWithUserInteractions(response.results.map(normalizeMovie), userId) as Promise<TMDBMovieWithMeta[]>;
}

export async function getTopRatedTvs(userId: string) {
  const response = await fetchTopRatedTvs();
  return enrichMediaWithUserInteractions(response.results.map(normalizeTv), userId) as Promise<TMDBTvWithMeta[]>;
}

export async function getMediaDetails(userId: string, mediaType: string, id: string) {
  const validMediaType = assertMediaType(mediaType);
  const mediaId = parseMediaId(id);
  const response = await fetchMediaDetails(validMediaType, mediaId);

  const [interactions, watchCount] = await prisma.$transaction([
    prisma.userMedia.findFirst({
      where: {
        userId,
        media_id: mediaId,
        media_type: validMediaType,
      },
    }),
    prisma.watchEvent.count({
      where: {
        userId,
        media_id: mediaId,
        media_type: validMediaType,
        seasonNumber: null,
        episodeNumber: null,
      },
    }),
  ]);

  const { id: responseMediaId, ...rest } = response;

  return {
    ...rest,
    media_id: responseMediaId,
    media_type: validMediaType,
    liked: interactions?.liked ?? false,
    watched: interactions?.watched ?? false,
    watchlist: interactions?.watchlist ?? false,
    watchCount,
    ...pickUserMediaTrackingDetails(interactions),
  } as TMDBMovieDetailsWithMeta | TMDBTvDetailsWithMeta;
}

export async function getWatchProviders(
  userId: string,
  mediaType: string,
  id: string,
  requestedRegion?: string,
): Promise<WatchProvidersResponse> {
  const validMediaType = assertMediaType(mediaType);
  const mediaId = parseMediaId(id);
  const userRegion = requestedRegion
    ? undefined
    : await prisma.user.findUnique({ where: { id: userId }, select: { watchRegion: true } });
  const region = assertWatchRegion(requestedRegion ?? userRegion?.watchRegion ?? DEFAULT_WATCH_REGION);
  const response = await fetchWatchProviders(validMediaType, mediaId);
  const regionResult = response.results[region];

  return {
    region: {
      code: region,
      name: getWatchRegionName(region) ?? region,
    },
    link: regionResult?.link ?? null,
    providers: {
      stream: normalizeWatchProviders(regionResult?.flatrate),
      rent: normalizeWatchProviders(regionResult?.rent),
      buy: normalizeWatchProviders(regionResult?.buy),
      free: normalizeWatchProviders(regionResult?.free),
      ads: normalizeWatchProviders(regionResult?.ads),
    },
    attribution: {
      provider: 'JustWatch',
    },
  };
}

export async function getGenres() {
  const movieGenre = await fetchMovieGenres();
  const tvGenre = await fetchTvGenres();

  const combinedGenreHashMap: Record<number, string> = {};

  movieGenre.genres.forEach((genre: { id: number; name: string }) => {
    combinedGenreHashMap[genre.id] = genre.name;
  });

  tvGenre.genres.forEach((genre: { id: number; name: string }) => {
    combinedGenreHashMap[genre.id] = genre.name;
  });

  return combinedGenreHashMap;
}

export async function searchMedia(userId: string, mediaType: string, query: string, page: number) {
  const validMediaType = assertMediaType(mediaType);
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      data: [],
      pagination: createPaginationMeta(1, 20, 0),
    };
  }

  if (validMediaType === 'movie') {
    const response = await searchMediaByType('movie', normalizedQuery, page);
    const data = (await enrichMediaWithUserInteractions(response.results.map(normalizeMovie), userId)) as
      | TMDBMovieWithMeta[]
      | TMDBTvWithMeta[];

    return {
      data,
      pagination: createPaginationMeta(page, 20, response.total_results),
    };
  }

  const response = await searchMediaByType('tv', normalizedQuery, page);
  const data = (await enrichMediaWithUserInteractions(response.results.map(normalizeTv), userId)) as
    | TMDBMovieWithMeta[]
    | TMDBTvWithMeta[];

  return {
    data,
    pagination: createPaginationMeta(page, 20, response.total_results),
  };
}
