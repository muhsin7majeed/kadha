import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { queryKeys } from '@/lib/query-keys';
import type { PaginatedResponse, ResourceAccessResponse } from '@/types/common';

import type { UserMedia, UserMediaPayload } from '../user-media.types';
import {
  getMediaActionCacheSnapshot,
  restoreMediaActionCacheSnapshot,
  updateMediaActionCache,
} from './update-media-action-cache';

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

describe('updateMediaActionCache', () => {
  it('patches details and removes watched media from the watchlist cache', () => {
    const queryClient = new QueryClient();
    const payload = createPayload({ media_id: 10, watched: true, watchlist: true });
    const cachedMedia = createUserMedia({ media_id: 10, watched: false, watchlist: true });

    queryClient.setQueryData(queryKeys.mediaDetailsById('movie', '10'), {
      media_id: 10,
      media_type: 'movie',
      watched: false,
      watchlist: true,
    });
    queryClient.setQueryData(queryKeys.liked, createSavedResponse([cachedMedia]));
    queryClient.setQueryData(queryKeys.watchList, createSavedResponse([cachedMedia]));

    updateMediaActionCache(queryClient, 'watched', payload);

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
});
