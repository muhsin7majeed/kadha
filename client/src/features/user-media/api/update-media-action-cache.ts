import { QueryClient, QueryKey } from '@tanstack/react-query';

import { MovieDetailsWithMeta, MovieWithMeta, TvDetailsWithMeta, TvWithMeta } from '@/features/media/media.types';
import { queryKeys } from '@/lib/query-keys';
import { MediaMeta, PaginatedResponse, ResourceAccessResponse } from '@/types/common';
import { UserMedia, UserMediaPayload } from '../user-media.types';

export type MediaAction = 'liked' | 'watched' | 'watchlist';

type MediaCacheItem = MovieWithMeta | TvWithMeta | MovieDetailsWithMeta | TvDetailsWithMeta | UserMedia;
type MediaListCache = MediaCacheItem[];
type PaginatedMediaCache = PaginatedResponse<MediaCacheItem[]>;
type ResourceMediaCache = ResourceAccessResponse<MediaCacheItem[]> & Partial<PaginatedResponse<MediaCacheItem[]>>;
type MediaCacheData = MediaCacheItem | MediaListCache | PaginatedMediaCache | ResourceMediaCache;

const mediaContentQueryKeys: QueryKey[] = [
  queryKeys.mediaDetails,
  queryKeys.searchMedia,
  queryKeys.trendingMovies,
  queryKeys.trendingTvs,
  queryKeys.topRatedMovies,
  queryKeys.topRatedTvs,
  queryKeys.popularMovies,
  queryKeys.popularTvs,
];

const savedListQueryKeys: Record<MediaAction, QueryKey[]> = {
  liked: [queryKeys.liked],
  watched: [queryKeys.watched],
  watchlist: [queryKeys.watchList],
};

const savedMediaQueryKeys: QueryKey[] = [queryKeys.liked, queryKeys.watched, queryKeys.watchList];

const getActionMetaUpdate = (action: MediaAction, payload: UserMediaPayload): MediaMeta => {
  if (action === 'watched') {
    return {
      watched: payload.watched ?? false,
      watchlist: false,
    };
  }

  return {
    [action]: payload[action] ?? false,
  };
};

const isSameMedia = (media: MediaCacheItem, payload: UserMediaPayload) =>
  media.media_id === payload.media_id && media.media_type === payload.media_type;

const patchMediaItem = <T extends MediaCacheItem>(media: T, payload: UserMediaPayload, meta: MediaMeta): T => {
  if (!isSameMedia(media, payload)) return media;

  return {
    ...media,
    ...meta,
  };
};

const patchMediaList = <T extends MediaCacheItem>(media: T[], payload: UserMediaPayload, meta: MediaMeta) =>
  media.map((item) => patchMediaItem(item, payload, meta));

const hasMediaDataArray = (data: MediaCacheData): data is PaginatedMediaCache | ResourceMediaCache =>
  'data' in data && Array.isArray(data.data);

const patchMediaCacheData = (
  oldData: MediaCacheData | undefined,
  payload: UserMediaPayload,
  meta: MediaMeta,
): MediaCacheData | undefined => {
  if (!oldData) return oldData;

  if (Array.isArray(oldData)) {
    return patchMediaList(oldData, payload, meta);
  }

  if (hasMediaDataArray(oldData)) {
    return {
      ...oldData,
      data: patchMediaList(oldData.data, payload, meta),
    };
  }

  return patchMediaItem(oldData, payload, meta);
};

const formatPayloadForSavedList = (
  payload: UserMediaPayload,
  meta: MediaMeta,
): UserMedia => ({
  media_id: payload.media_id,
  media_type: payload.media_type,
  title: payload.title,
  original_title: payload.original_title,
  overview: payload.overview,
  poster_path: payload.poster_path ?? null,
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
  ...meta,
});

const updatePaginationTotal = <T extends ResourceMediaCache>(data: T, totalDelta: number): T => {
  if (!data.pagination || totalDelta === 0) return data;

  const total = Math.max(data.pagination.total + totalDelta, 0);
  const totalPages = Math.max(Math.ceil(total / data.pagination.limit), total > 0 ? 1 : 0);

  return {
    ...data,
    pagination: {
      ...data.pagination,
      total,
      totalPages,
      hasNextPage: data.pagination.page < totalPages,
      hasPreviousPage: data.pagination.page > 1,
    },
  };
};

const updateSavedListData = (
  oldData: ResourceMediaCache | undefined,
  action: MediaAction,
  payload: UserMediaPayload,
  shouldInclude: boolean,
): ResourceMediaCache | undefined => {
  if (!oldData) return oldData;

  const meta = getActionMetaUpdate(action, payload);
  const existingItem = oldData.data.find((item) => isSameMedia(item, payload));
  const patchedData = patchMediaList(oldData.data, payload, meta);

  if (!shouldInclude) {
    const data = patchedData.filter((item) => !isSameMedia(item, payload));
    return updatePaginationTotal({ ...oldData, data }, existingItem ? -1 : 0);
  }

  if (existingItem) {
    return {
      ...oldData,
      data: patchedData,
    };
  }

  const newItem = formatPayloadForSavedList(payload, meta);
  const limit = oldData.pagination?.limit;
  const data = limit ? [newItem, ...patchedData].slice(0, limit) : [newItem, ...patchedData];

  return updatePaginationTotal({ ...oldData, data }, 1);
};

const updateSavedListQueries = (
  queryClient: QueryClient,
  queryKey: QueryKey,
  action: MediaAction,
  payload: UserMediaPayload,
  shouldInclude: boolean,
) => {
  queryClient.getQueriesData<ResourceMediaCache>({ queryKey }).forEach(([matchedQueryKey]) => {
    const page = matchedQueryKey[1];

    queryClient.setQueryData<ResourceMediaCache>(matchedQueryKey, (oldData) => {
      if (typeof page === 'number' && page !== 1 && shouldInclude) {
        const existingItem = oldData?.data.find((item) => isSameMedia(item, payload));

        return oldData
          ? updatePaginationTotal(
              {
                ...oldData,
                data: patchMediaList(oldData.data, payload, getActionMetaUpdate(action, payload)),
              },
              existingItem ? 0 : 1,
            )
          : oldData;
      }

      return updateSavedListData(oldData, action, payload, shouldInclude);
    });
  });
};

export const updateMediaActionCache = (queryClient: QueryClient, action: MediaAction, payload: UserMediaPayload) => {
  const meta = getActionMetaUpdate(action, payload);

  mediaContentQueryKeys.forEach((queryKey) => {
    queryClient.setQueriesData<MediaCacheData>({ queryKey }, (oldData) => patchMediaCacheData(oldData, payload, meta));
  });

  savedMediaQueryKeys.forEach((queryKey) => {
    queryClient.setQueriesData<ResourceMediaCache>({ queryKey }, (oldData) =>
      oldData
        ? {
            ...oldData,
            data: patchMediaList(oldData.data, payload, meta),
          }
        : oldData,
    );
  });

  savedListQueryKeys[action].forEach((queryKey) => {
    updateSavedListQueries(queryClient, queryKey, action, payload, Boolean(payload[action]));
  });

  if (action === 'watched') {
    updateSavedListQueries(queryClient, queryKeys.watchList, 'watchlist', payload, false);
  }
};
