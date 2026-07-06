import { QueryClient, QueryKey } from '@tanstack/react-query';

import { MovieDetailsWithMeta, TvDetailsWithMeta } from '@/features/media/media.types';
import { queryKeys } from '@/lib/query-keys';
import { MediaMeta, PaginatedResponse, ResourceAccessResponse } from '@/types/common';
import { MediaAction, UserMedia, UserMediaPayload } from '../user-media.types';

type MediaIdentity = Pick<UserMediaPayload, 'media_id' | 'media_type'>;
type MediaDetailsCache = MovieDetailsWithMeta | TvDetailsWithMeta;
type SavedMediaCache = ResourceAccessResponse<UserMedia[]> & Partial<PaginatedResponse<UserMedia[]>>;
export type MediaActionCacheSnapshot = Array<[QueryKey, unknown]>;

const mediaContentQueryKeys: QueryKey[] = [queryKeys.mediaDetails];

const mediaDiscoveryQueryKeys: QueryKey[] = [
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
const optimisticMediaQueryKeys: QueryKey[] = [...mediaContentQueryKeys, ...savedMediaQueryKeys];

const queryKeyStartsWith = (queryKey: QueryKey, prefix: QueryKey) =>
  prefix.every((keyPart, index) => queryKey[index] === keyPart);

export const getMediaActionCacheSnapshot = (queryClient: QueryClient): MediaActionCacheSnapshot =>
  queryClient
    .getQueryCache()
    .findAll({
      predicate: (query) => optimisticMediaQueryKeys.some((queryKey) => queryKeyStartsWith(query.queryKey, queryKey)),
    })
    .map((query) => [query.queryKey, query.state.data]);

export const restoreMediaActionCacheSnapshot = (queryClient: QueryClient, snapshot: MediaActionCacheSnapshot) => {
  snapshot.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
};

export const invalidateMediaDiscoveryQueries = (queryClient: QueryClient) =>
  Promise.all(mediaDiscoveryQueryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));

const getActionMetaUpdate = (action: MediaAction, payload: UserMediaPayload): MediaMeta => {
  const trackingMeta = getTrackingMetaUpdate(payload);

  if (action === 'watched') {
    return {
      watched: payload.watched ?? false,
      watchlist: false,
      ...(hasPayloadKey(payload, 'liked') ? { liked: payload.liked ?? false } : {}),
      ...trackingMeta,
    };
  }

  return {
    [action]: payload[action] ?? false,
    ...(action === 'liked' && payload.watched ? { watched: true, watchlist: false } : {}),
    ...trackingMeta,
  };
};

const hasPayloadKey = <Key extends keyof UserMediaPayload>(payload: UserMediaPayload, key: Key) =>
  Object.prototype.hasOwnProperty.call(payload, key);

const getTrackingMetaUpdate = (payload: UserMediaPayload): MediaMeta => {
  const meta: MediaMeta = {};

  if (hasPayloadKey(payload, 'rating')) {
    meta.rating = payload.rating ?? null;
  }

  if (hasPayloadKey(payload, 'watchedOn')) {
    meta.watchedOn = payload.watchedOn ?? null;
  }

  if (hasPayloadKey(payload, 'likedNote')) {
    meta.likedNote = payload.likedNote ?? null;
  }

  if (hasPayloadKey(payload, 'watchedNote')) {
    meta.watchedNote = payload.watchedNote ?? null;
  }

  if (hasPayloadKey(payload, 'watchlistNote')) {
    meta.watchlistNote = payload.watchlistNote ?? null;
  }

  return meta;
};

const isSameMedia = (media: MediaIdentity, identity: MediaIdentity) =>
  media.media_id === identity.media_id && media.media_type === identity.media_type;

const patchMediaItem = <T extends MediaIdentity>(media: T, payload: UserMediaPayload, meta: MediaMeta): T => {
  if (!isSameMedia(media, payload)) return media;

  return {
    ...media,
    ...meta,
  };
};

const patchMediaList = <T extends MediaIdentity>(media: T[], payload: UserMediaPayload, meta: MediaMeta) =>
  media.map((item) => patchMediaItem(item, payload, meta));

const patchMediaDetailsData = (
  oldData: MediaDetailsCache | undefined,
  payload: UserMediaPayload,
  meta: MediaMeta,
): MediaDetailsCache | undefined => (oldData ? patchMediaItem(oldData, payload, meta) : oldData);

const formatPayloadForSavedList = (payload: UserMediaPayload, meta: MediaMeta): UserMedia => ({
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
  ...getTrackingMetaUpdate(payload),
  ...meta,
});

const updatePaginationTotal = <T extends SavedMediaCache>(data: T, totalDelta: number): T => {
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
  oldData: SavedMediaCache | undefined,
  action: MediaAction,
  payload: UserMediaPayload,
  shouldInclude: boolean,
): SavedMediaCache | undefined => {
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
  queryClient.getQueriesData<SavedMediaCache>({ queryKey }).forEach(([matchedQueryKey]) => {
    const page = matchedQueryKey[1];

    queryClient.setQueryData<SavedMediaCache>(matchedQueryKey, (oldData) => {
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
    queryClient.setQueriesData<MediaDetailsCache>({ queryKey }, (oldData) =>
      patchMediaDetailsData(oldData, payload, meta),
    );
  });

  savedMediaQueryKeys.forEach((queryKey) => {
    queryClient.setQueriesData<SavedMediaCache>({ queryKey }, (oldData) =>
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

    if (hasPayloadKey(payload, 'liked')) {
      updateSavedListQueries(queryClient, queryKeys.liked, 'liked', payload, Boolean(payload.liked));
    }
  }

  if (action === 'liked' && payload.watched) {
    updateSavedListQueries(queryClient, queryKeys.watched, 'watched', payload, true);
    updateSavedListQueries(queryClient, queryKeys.watchList, 'watchlist', payload, false);
  }
};
