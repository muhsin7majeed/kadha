import { QueryClient, QueryKey } from '@tanstack/react-query';

import { MovieDetailsWithMeta, TvDetailsWithMeta } from '@/features/media/media.types';
import { queryKeys, upcomingQueryKeys } from '@/lib/query-keys';
import { MediaMeta, PaginatedResponse, ResourceAccessResponse } from '@/types/common';
import { MediaAction, TvInProgressItem, UserMedia, UserMediaPayload } from '../user-media.types';

type MediaIdentity = Pick<UserMediaPayload, 'media_id' | 'media_type'>;
type MediaDetailsCache = MovieDetailsWithMeta | TvDetailsWithMeta;
type MediaDiscoveryCache = MediaIdentity[] | PaginatedResponse<MediaIdentity[]>;
type SavedMediaCache = ResourceAccessResponse<UserMedia[]> & Partial<PaginatedResponse<UserMedia[]>>;
type InProgressTvCache = ResourceAccessResponse<TvInProgressItem[]> & Partial<PaginatedResponse<TvInProgressItem[]>>;
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
  queryKeys.nowPlayingMovies,
];

const savedListQueryKeys: Record<MediaAction, QueryKey[]> = {
  liked: [queryKeys.liked],
  watched: [queryKeys.watched],
  watchlist: [queryKeys.watchList],
};

const savedMediaQueryKeys: QueryKey[] = [queryKeys.liked, queryKeys.watched, queryKeys.watchList];
const optimisticMediaQueryKeys: QueryKey[] = [
  ...mediaContentQueryKeys,
  ...mediaDiscoveryQueryKeys,
  ...savedMediaQueryKeys,
  queryKeys.inProgressTvRoot,
];

const queryKeyStartsWith = (queryKey: QueryKey, prefix: QueryKey) =>
  prefix.every((keyPart, index) => queryKey[index] === keyPart);

const isOptimisticMediaQuery = (query: { queryKey: QueryKey }) =>
  optimisticMediaQueryKeys.some((queryKey) => queryKeyStartsWith(query.queryKey, queryKey));

export const cancelOptimisticMediaActionQueries = (queryClient: QueryClient) =>
  queryClient.cancelQueries({ predicate: isOptimisticMediaQuery });

export const getMediaActionCacheSnapshot = (queryClient: QueryClient): MediaActionCacheSnapshot =>
  queryClient
    .getQueryCache()
    .findAll({ predicate: isOptimisticMediaQuery })
    .map((query) => [query.queryKey, query.state.data]);

export const restoreMediaActionCacheSnapshot = (queryClient: QueryClient, snapshot: MediaActionCacheSnapshot) => {
  snapshot.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
};

const getAffectedSavedListActions = (
  action: MediaAction,
  payload: UserMediaPayload,
  keepWatchedOnWatchlist: boolean | undefined,
): MediaAction[] => {
  const actions = new Set<MediaAction>([action]);
  const changesWatched = action === 'watched' || (action === 'liked' && payload.watched === true);

  if (changesWatched) {
    actions.add('watched');

    if (keepWatchedOnWatchlist !== true) {
      actions.add('watchlist');
    }
  }

  if (action === 'watched' && typeof payload.liked === 'boolean') {
    actions.add('liked');
  }

  return [...actions];
};

const profileQueryKeyByAction: Record<MediaAction, QueryKey> = {
  liked: queryKeys.userLikedRoot,
  watched: queryKeys.userWatchedRoot,
  watchlist: queryKeys.userWatchListRoot,
};

export const hasFreshCachedInProgressTv = (queryClient: QueryClient, payload: UserMediaPayload) =>
  payload.media_type === 'tv' &&
  queryClient.getQueryCache().findAll({ queryKey: queryKeys.inProgressTvRoot })
    .some((query) => !query.state.isInvalidated &&
      queryClient.getQueryData<InProgressTvCache>(query.queryKey)?.data.some(
        (item) => item.media_id === payload.media_id && item.media_type === 'tv',
      ));

export const invalidateMediaActionQueries = (
  queryClient: QueryClient,
  action: MediaAction,
  payload: UserMediaPayload,
  keepWatchedOnWatchlist: boolean | undefined,
  episodeTracked: boolean,
) => {
  const affectedActions = getAffectedSavedListActions(action, payload, keepWatchedOnWatchlist);
  const changesWatched = action === 'watched' || (action === 'liked' && payload.watched === true);
  const affectsUpcoming = action !== 'watchlist' || !episodeTracked;
  const queryKeysToInvalidate: QueryKey[] = [
    ...mediaDiscoveryQueryKeys,
    ...affectedActions.flatMap((affectedAction) => [
      ...savedListQueryKeys[affectedAction],
      profileQueryKeyByAction[affectedAction],
    ]),
    queryKeys.recommendationsRoot,
    ...(affectsUpcoming ? [upcomingQueryKeys.root] : []),
  ];

  if (action === 'liked' || changesWatched) {
    queryKeysToInvalidate.push(queryKeys.viewingInsightsRoot);
  }

  if (changesWatched && keepWatchedOnWatchlist === undefined) {
    queryKeysToInvalidate.push(queryKeys.mediaDetails);

    if (!affectedActions.includes('liked')) {
      queryKeysToInvalidate.push(queryKeys.liked, queryKeys.userLikedRoot);
    }

    if (payload.media_type === 'tv') {
      queryKeysToInvalidate.push(queryKeys.inProgressTvRoot);
    }
  }

  return Promise.all(queryKeysToInvalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
};

const getActionMetaUpdate = (
  action: MediaAction,
  payload: UserMediaPayload,
  keepWatchedOnWatchlist: boolean | undefined,
): MediaMeta => {
  const trackingMeta = getTrackingMetaUpdate(payload);
  const watchlistUpdate = keepWatchedOnWatchlist === false ? { watchlist: false } : {};

  if (action === 'watched') {
    return {
      watched: payload.watched ?? false,
      ...watchlistUpdate,
      ...(hasPayloadKey(payload, 'liked') ? { liked: payload.liked ?? false } : {}),
      ...trackingMeta,
    };
  }

  return {
    [action]: payload[action] ?? false,
    ...(action === 'liked' && payload.watched ? { watched: true, ...watchlistUpdate } : {}),
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

const patchMediaDiscoveryData = (
  oldData: MediaDiscoveryCache | undefined,
  payload: UserMediaPayload,
  meta: MediaMeta,
): MediaDiscoveryCache | undefined => {
  if (!oldData) return oldData;

  if (Array.isArray(oldData)) {
    return patchMediaList(oldData, payload, meta);
  }

  return {
    ...oldData,
    data: patchMediaList(oldData.data, payload, meta),
  };
};

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
  liked: payload.liked,
  watched: payload.watched,
  watchlist: payload.watchlist,
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
  keepWatchedOnWatchlist: boolean | undefined,
): SavedMediaCache | undefined => {
  if (!oldData) return oldData;

  const meta = getActionMetaUpdate(action, payload, keepWatchedOnWatchlist);
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
  keepWatchedOnWatchlist: boolean | undefined,
) => {
  queryClient.getQueriesData<SavedMediaCache>({ queryKey }).forEach(([matchedQueryKey]) => {
    const queryState = matchedQueryKey[1];
    const page =
      typeof queryState === 'number'
        ? queryState
        : typeof queryState === 'object' && queryState !== null && 'page' in queryState
          ? queryState.page
          : 1;

    queryClient.setQueryData<SavedMediaCache>(matchedQueryKey, (oldData) => {
      const existingItem = oldData?.data.find((item) => isSameMedia(item, payload));

      if (typeof queryState === 'object' && shouldInclude && !existingItem) {
        return oldData;
      }

      if (typeof page === 'number' && page !== 1 && shouldInclude) {
        return oldData
          ? updatePaginationTotal(
              {
                ...oldData,
                data: patchMediaList(
                  oldData.data,
                  payload,
                  getActionMetaUpdate(action, payload, keepWatchedOnWatchlist),
                ),
              },
              existingItem ? 0 : 1,
            )
          : oldData;
      }

      return updateSavedListData(oldData, action, payload, shouldInclude, keepWatchedOnWatchlist);
    });
  });
};

export const updateMediaActionCache = (
  queryClient: QueryClient,
  action: MediaAction,
  payload: UserMediaPayload,
  keepWatchedOnWatchlist?: boolean,
) => {
  const meta = getActionMetaUpdate(action, payload, keepWatchedOnWatchlist);

  mediaContentQueryKeys.forEach((queryKey) => {
    queryClient.setQueriesData<MediaDetailsCache>({ queryKey }, (oldData) =>
      patchMediaDetailsData(oldData, payload, meta),
    );
  });

  mediaDiscoveryQueryKeys.forEach((queryKey) => {
    queryClient.setQueriesData<MediaDiscoveryCache>({ queryKey }, (oldData) =>
      patchMediaDiscoveryData(oldData, payload, meta),
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

  if (payload.media_type === 'tv') {
    queryClient.setQueriesData<InProgressTvCache>({ queryKey: queryKeys.inProgressTvRoot }, (oldData) =>
      oldData
        ? {
            ...oldData,
            data: patchMediaList(oldData.data, payload, meta),
          }
        : oldData,
    );
  }

  savedListQueryKeys[action].forEach((queryKey) => {
    updateSavedListQueries(
      queryClient,
      queryKey,
      action,
      payload,
      Boolean(payload[action]),
      keepWatchedOnWatchlist,
    );
  });

  if (action === 'watched') {
    if (keepWatchedOnWatchlist === false) {
      updateSavedListQueries(queryClient, queryKeys.watchList, 'watchlist', payload, false, keepWatchedOnWatchlist);
    }

    if (hasPayloadKey(payload, 'liked')) {
      updateSavedListQueries(
        queryClient,
        queryKeys.liked,
        'liked',
        payload,
        Boolean(payload.liked),
        keepWatchedOnWatchlist,
      );
    }
  }

  if (action === 'liked' && payload.watched) {
    updateSavedListQueries(queryClient, queryKeys.watched, 'watched', payload, true, keepWatchedOnWatchlist);

    if (keepWatchedOnWatchlist === false) {
      updateSavedListQueries(queryClient, queryKeys.watchList, 'watchlist', payload, false, keepWatchedOnWatchlist);
    }
  }
};
