import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { queryKeys, upcomingQueryKeys } from '@/lib/query-keys';
import type { PaginatedResponse, ResourceAccessResponse } from '@/types/common';

import type { TvInProgressItem, UserMedia, UserMediaPayload } from '../user-media.types';
import {
  getMediaActionCacheSnapshot,
  hasFreshCachedInProgressTv,
  invalidateMediaActionQueries,
  restoreMediaActionCacheSnapshot,
  updateMediaActionCache,
} from './update-media-action-cache';
import { defaultOwnerMediaQuery } from './use-owner-media-query';

type SavedMediaResponse = ResourceAccessResponse<UserMedia[]> & Partial<PaginatedResponse<UserMedia[]>>;

const createPayload = (overrides: Partial<UserMediaPayload> = {}): UserMediaPayload => ({
  adult: false,
  backdrop_path: '/backdrop.jpg',
  genre_ids: [18],
  liked: false,
  media_id: 1,
  media_type: 'movie',
  original_language: 'en',
  original_title: 'Original Title',
  overview: 'Overview',
  popularity: 10,
  poster_path: '/poster.jpg',
  release_date: '2025-01-01',
  runtime: 120,
  status: 'Released',
  title: 'Example Movie',
  vote_average: 8,
  vote_count: 100,
  watched: false,
  watchlist: false,
  ...overrides,
});

const createUserMedia = (overrides: Partial<UserMedia> = {}): UserMedia => ({
  ...createPayload(),
  ...overrides,
});

const createSavedResponse = (data: UserMedia[], total = data.length): SavedMediaResponse => ({
  access: {
    canView: true,
  },
  data,
  pagination: {
    hasNextPage: total > 10,
    hasPreviousPage: false,
    limit: 10,
    page: 1,
    total,
    totalPages: total > 0 ? Math.ceil(total / 10) : 0,
  },
});

const createInProgressItem = (overrides: Partial<TvInProgressItem> = {}): TvInProgressItem => ({
  ...createUserMedia({ media_id: 21, media_type: 'tv', title: 'Example Show', watchlist: true }),
  tvProgress: {
    status: 'in_progress',
    watchedEpisodeCount: 1,
    totalAiredEpisodeCount: 2,
    nextEpisode: {
      seasonNumber: 1,
      episodeNumber: 2,
      episodeId: 102,
      name: 'Second episode',
      airDate: '2025-01-08',
    },
    lastWatchedAt: '2025-01-01T00:00:00.000Z',
  },
  ...overrides,
});

const createInProgressResponse = (data: TvInProgressItem[]) => ({
  access: { canView: true },
  data,
  pagination: {
    hasNextPage: false,
    hasPreviousPage: false,
    limit: 20,
    page: 1,
    total: data.length,
    totalPages: data.length > 0 ? 1 : 0,
  },
});

describe('updateMediaActionCache', () => {
  it('patches details and removes watched media from the watchlist cache', () => {
    const queryClient = new QueryClient();
    const payload = createPayload({ media_id: 10, watched: true, watchlist: true });
    const cachedMedia = createUserMedia({ media_id: 10, watched: false, watchlist: true });
    delete payload.liked;

    queryClient.setQueryData(queryKeys.mediaDetailsById('movie', '10'), {
      media_id: 10,
      media_type: 'movie',
      watched: false,
      watchlist: true,
    });
    queryClient.setQueryData(queryKeys.liked, createSavedResponse([cachedMedia]));
    queryClient.setQueryData(queryKeys.watchList, createSavedResponse([cachedMedia]));

    updateMediaActionCache(queryClient, 'watched', payload, false);

    expect(queryClient.getQueryData<{ watched?: boolean; watchlist?: boolean }>(queryKeys.mediaDetailsById('movie', '10'))).toMatchObject({
      watched: true,
      watchlist: false,
    });
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.liked)?.data[0]).toMatchObject({
      media_id: 10,
      watched: true,
      watchlist: false,
    });
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.watchList)?.data).toEqual([]);
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.watchList)?.pagination?.total).toBe(0);
  });

  it('adds newly liked media to the liked cache and updates pagination totals', () => {
    const queryClient = new QueryClient();
    const payload = createPayload({ liked: true, media_id: 11, title: 'Liked Movie' });

    queryClient.setQueryData(queryKeys.liked, createSavedResponse([], 0));

    updateMediaActionCache(queryClient, 'liked', payload);

    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.liked)?.data[0]).toMatchObject({
      liked: true,
      media_id: 11,
      title: 'Liked Movie',
    });
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.liked)?.pagination).toMatchObject({
      total: 1,
      totalPages: 1,
    });
  });

  it('patches tracking details in detail and saved-list caches', () => {
    const queryClient = new QueryClient();
    const payload = createPayload({
      liked: true,
      media_id: 13,
      rating: 9,
      likedNote: 'Private favorite.',
    });

    queryClient.setQueryData(queryKeys.mediaDetailsById('movie', '13'), {
      media_id: 13,
      media_type: 'movie',
      liked: false,
      rating: null,
    });
    queryClient.setQueryData(queryKeys.liked, createSavedResponse([], 0));

    updateMediaActionCache(queryClient, 'liked', payload);

    expect(
      queryClient.getQueryData<{ liked?: boolean; rating?: number | null; likedNote?: string | null }>(
        queryKeys.mediaDetailsById('movie', '13'),
      ),
    ).toMatchObject({
      liked: true,
      rating: 9,
      likedNote: 'Private favorite.',
    });
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.liked)?.data[0]).toMatchObject({
      liked: true,
      media_id: 13,
      rating: 9,
      likedNote: 'Private favorite.',
    });
  });

  it('patches now-playing movie cache entries without waiting for a refresh', () => {
    const queryClient = new QueryClient();
    const payload = createPayload({ liked: true, media_id: 15, title: 'Now Playing Movie' });

    queryClient.setQueryData(queryKeys.nowPlayingMovies, [
      {
        ...createUserMedia({ media_id: 15, liked: false, title: 'Now Playing Movie' }),
        video: false,
      },
    ]);

    updateMediaActionCache(queryClient, 'liked', payload);

    expect(queryClient.getQueryData<Array<{ liked?: boolean; media_id: number }>>(queryKeys.nowPlayingMovies)?.[0]).toMatchObject({
      liked: true,
      media_id: 15,
    });
  });

  it('updates watched and watchlist caches when liking also marks watched', () => {
    const queryClient = new QueryClient();
    const payload = createPayload({
      liked: true,
      watched: true,
      watchlist: true,
      media_id: 14,
      title: 'Liked Watched Movie',
    });
    const watchlistItem = createUserMedia({ media_id: 14, watchlist: true });

    queryClient.setQueryData(queryKeys.liked, createSavedResponse([], 0));
    queryClient.setQueryData(queryKeys.watched, createSavedResponse([], 0));
    queryClient.setQueryData(queryKeys.watchList, createSavedResponse([watchlistItem], 1));

    updateMediaActionCache(queryClient, 'liked', payload, false);

    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.liked)?.data[0]).toMatchObject({
      liked: true,
      watched: true,
      watchlist: false,
    });
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.watched)?.data[0]).toMatchObject({
      liked: true,
      watched: true,
      watchlist: false,
    });
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.watchList)?.data).toEqual([]);
  });

  it('patches every cached in-progress TV row for a watchlist toggle and restores it on rollback', () => {
    const queryClient = new QueryClient();
    const recentKey = queryKeys.inProgressTv(1, 'recent', 20);
    const nextKey = queryKeys.inProgressTv(1, 'next', 10);
    const matchingItem = createInProgressItem();
    const otherItem = createInProgressItem({ media_id: 22, title: 'Other Show' });
    const payload = createPayload({
      media_id: 21,
      media_type: 'tv',
      title: 'Example Show',
      watchlist: false,
    });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    queryClient.setQueryData(recentKey, createInProgressResponse([matchingItem, otherItem]));
    queryClient.setQueryData(nextKey, createInProgressResponse([matchingItem]));
    const snapshot = getMediaActionCacheSnapshot(queryClient);

    updateMediaActionCache(queryClient, 'watchlist', payload, false);

    expect(queryClient.getQueryData<{ data: TvInProgressItem[] }>(recentKey)?.data).toMatchObject([
      { media_id: 21, watchlist: false },
      { media_id: 22, watchlist: true },
    ]);
    expect(queryClient.getQueryData<{ data: TvInProgressItem[] }>(nextKey)?.data[0]).toMatchObject({
      media_id: 21,
      watchlist: false,
    });
    expect(invalidate).not.toHaveBeenCalled();

    restoreMediaActionCacheSnapshot(queryClient, snapshot);

    expect(queryClient.getQueryData<{ data: TvInProgressItem[] }>(recentKey)?.data[0]).toMatchObject({
      media_id: 21,
      watchlist: true,
    });
    expect(queryClient.getQueryData<{ data: TvInProgressItem[] }>(nextKey)?.data[0]).toMatchObject({
      media_id: 21,
      watchlist: true,
    });
  });

  it('preserves watchlist state for optimistic watched actions when the loaded preference opts in', () => {
    const queryClient = new QueryClient();
    const payload = createPayload({ media_id: 23, watched: true, watchlist: true });
    const cachedMedia = createUserMedia({ media_id: 23, watched: false, watchlist: true });

    queryClient.setQueryData(queryKeys.mediaDetailsById('movie', '23'), cachedMedia);
    queryClient.setQueryData(queryKeys.watched, createSavedResponse([]));
    queryClient.setQueryData(queryKeys.watchList, createSavedResponse([cachedMedia]));

    updateMediaActionCache(queryClient, 'watched', payload, true);

    expect(queryClient.getQueryData<UserMedia>(queryKeys.mediaDetailsById('movie', '23'))).toMatchObject({
      watched: true,
      watchlist: true,
    });
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.watched)?.data[0]).toMatchObject({
      watched: true,
      watchlist: true,
    });
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.watchList)?.data).toHaveLength(1);
  });

  it('preserves watchlist state when liking also marks watched and the loaded preference opts in', () => {
    const queryClient = new QueryClient();
    const payload = createPayload({ liked: true, media_id: 24, watched: true, watchlist: true });
    const cachedMedia = createUserMedia({ media_id: 24, watched: false, watchlist: true });

    queryClient.setQueryData(queryKeys.liked, createSavedResponse([]));
    queryClient.setQueryData(queryKeys.watched, createSavedResponse([]));
    queryClient.setQueryData(queryKeys.watchList, createSavedResponse([cachedMedia]));

    updateMediaActionCache(queryClient, 'liked', payload, true);

    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.liked)?.data[0]).toMatchObject({
      liked: true,
      watched: true,
      watchlist: true,
    });
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.watched)?.data[0]).toMatchObject({
      watched: true,
      watchlist: true,
    });
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.watchList)?.data).toHaveLength(1);
  });

  it('keeps the existing default optimistic watchlist clearing when the loaded preference is off', () => {
    const queryClient = new QueryClient();
    const payload = createPayload({ media_id: 25, watched: true, watchlist: true });
    const cachedMedia = createUserMedia({ media_id: 25, watched: false, watchlist: true });

    queryClient.setQueryData(queryKeys.mediaDetailsById('movie', '25'), cachedMedia);
    queryClient.setQueryData(queryKeys.watchList, createSavedResponse([cachedMedia]));

    updateMediaActionCache(queryClient, 'watched', payload, false);

    expect(queryClient.getQueryData<UserMedia>(queryKeys.mediaDetailsById('movie', '25'))).toMatchObject({
      watched: true,
      watchlist: false,
    });
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.watchList)?.data).toEqual([]);
  });

  it('does not optimistically clear watchlist state when the preference cache is absent', () => {
    const queryClient = new QueryClient();
    const payload = createPayload({ media_id: 26, watched: true, watchlist: true });
    const cachedMedia = createUserMedia({ media_id: 26, watched: false, watchlist: true });

    queryClient.setQueryData(queryKeys.mediaDetailsById('movie', '26'), cachedMedia);
    queryClient.setQueryData(queryKeys.watchList, createSavedResponse([cachedMedia]));

    updateMediaActionCache(queryClient, 'watched', payload, undefined);

    expect(queryClient.getQueryData<UserMedia>(queryKeys.mediaDetailsById('movie', '26'))).toMatchObject({
      watched: true,
      watchlist: true,
    });
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKeys.watchList)?.data).toHaveLength(1);
  });

  it('captures and restores optimistic cache snapshots', () => {
    const queryClient = new QueryClient();
    const queryKey = queryKeys.mediaDetailsById('movie', '12');
    const payload = createPayload({ liked: true, media_id: 12 });

    queryClient.setQueryData(queryKey, {
      liked: false,
      media_id: 12,
      media_type: 'movie',
    });

    const snapshot = getMediaActionCacheSnapshot(queryClient);

    updateMediaActionCache(queryClient, 'liked', payload);
    restoreMediaActionCacheSnapshot(queryClient, snapshot);

    expect(queryClient.getQueryData<{ liked?: boolean }>(queryKey)).toMatchObject({ liked: false });
  });

  it('does not insert new media into parameterized list caches before server filtering', () => {
    const queryClient = new QueryClient();
    const payload = createPayload({ liked: true, media_id: 16, title: 'Does not match' });
    const queryKey = queryKeys.likedList({ ...defaultOwnerMediaQuery, query: 'something else' });

    queryClient.setQueryData(queryKey, createSavedResponse([], 0));
    updateMediaActionCache(queryClient, 'liked', payload);

    expect(queryClient.getQueryData<SavedMediaResponse>(queryKey)).toEqual(createSavedResponse([], 0));
  });

  it('removes and restores media in filtered caches during optimistic rollback', () => {
    const queryClient = new QueryClient();
    const cachedMedia = createUserMedia({ liked: true, media_id: 17 });
    const payload = createPayload({ liked: false, media_id: 17 });
    const queryKey = queryKeys.likedList({ ...defaultOwnerMediaQuery, rating: 'rated' });
    queryClient.setQueryData(queryKey, createSavedResponse([cachedMedia], 1));
    const snapshot = getMediaActionCacheSnapshot(queryClient);

    updateMediaActionCache(queryClient, 'liked', payload);
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKey)?.data).toEqual([]);

    restoreMediaActionCacheSnapshot(queryClient, snapshot);
    expect(queryClient.getQueryData<SavedMediaResponse>(queryKey)?.data[0]).toMatchObject({ media_id: 17, liked: true });
  });

  it('does not reload Upcoming for a TV watchlist toggle already covered by episode tracking', async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
    const payload = createPayload({ media_id: 27, media_type: 'tv', watchlist: true });
    queryClient.setQueryData(queryKeys.inProgressTv(), createSavedResponse([createUserMedia({ media_id: 27, media_type: 'tv' })]));

    const episodeTracked = hasFreshCachedInProgressTv(queryClient, payload);
    await invalidateMediaActionQueries(queryClient, 'watchlist', payload, false, episodeTracked);

    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: upcomingQueryKeys.root });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: queryKeys.inProgressTvRoot });
  });

  it('refreshes Upcoming when a cached In Progress row was invalidated by episode changes', async () => {
    const queryClient = new QueryClient();
    const payload = createPayload({ media_id: 27, media_type: 'tv', watchlist: true });
    queryClient.setQueryData(queryKeys.inProgressTv(), createSavedResponse([createUserMedia({ media_id: 27, media_type: 'tv' })]));
    await queryClient.invalidateQueries({ queryKey: queryKeys.inProgressTvRoot, refetchType: 'none' });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

    const episodeTracked = hasFreshCachedInProgressTv(queryClient, payload);
    await invalidateMediaActionQueries(queryClient, 'watchlist', payload, false, episodeTracked);

    expect(invalidate).toHaveBeenCalledWith({ queryKey: upcomingQueryKeys.root });
  });

  it('invalidates only watchlist membership dependents after a successful watchlist toggle', async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
    const payload = createPayload({ media_id: 27, media_type: 'tv', watchlist: false });

    await invalidateMediaActionQueries(queryClient, 'watchlist', payload, false, false);

    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.watchList });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.userWatchListRoot });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: upcomingQueryKeys.root });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: queryKeys.watched });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: queryKeys.userWatchedRoot });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: queryKeys.inProgressTvRoot });
  });

  it('invalidates watched and possibly cleared watchlist dependents after a watched action', async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
    const payload = createPayload({ media_id: 28, media_type: 'tv', watched: true, watchlist: true });

    await invalidateMediaActionQueries(queryClient, 'watched', payload, false, false);

    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.watched });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.watchList });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.userWatchedRoot });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.userWatchListRoot });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: upcomingQueryKeys.root });
  });

  it('reconciles in-progress TV rows after watched success only when the preference was unknown', async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();
    const payload = createPayload({ media_id: 29, media_type: 'tv', watched: true, watchlist: true });
    delete payload.liked;

    await invalidateMediaActionQueries(queryClient, 'watched', payload, undefined, false);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.inProgressTvRoot });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.mediaDetails });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.liked });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.userLikedRoot });

    invalidate.mockClear();
    await invalidateMediaActionQueries(queryClient, 'watched', payload, true, false);
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: queryKeys.inProgressTvRoot });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: queryKeys.mediaDetails });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: queryKeys.liked });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: queryKeys.userLikedRoot });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: queryKeys.watchList });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: queryKeys.userWatchListRoot });
  });
});
