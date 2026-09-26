import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { queryKeys, upcomingQueryKeys } from '@/lib/query-keys';
import type { UserMediaPayload } from '../user-media.types';
import invalidateMediaActionQueries from './invalidate-media-action-queries';

const movie: UserMediaPayload = {
  adult: false,
  backdrop_path: null,
  genre_ids: [],
  media_id: 12,
  media_type: 'movie',
  original_language: 'en',
  original_title: 'Example',
  overview: '',
  popularity: 0,
  poster_path: null,
  release_date: '2026-09-01',
  runtime: 90,
  status: 'Released',
  title: 'Example',
  vote_average: 0,
  vote_count: 0,
};

describe('media action invalidation', () => {
  it('refreshes personal lists and exact details without reloading Upcoming for a plain movie Like', async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

    await invalidateMediaActionQueries(queryClient, 'liked', { ...movie, liked: true });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.mediaDetailsById('movie', '12') });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.userLikedRoot });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.watchList });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: upcomingQueryKeys.root });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: queryKeys.inProgressTvRoot });
  });

  it('refreshes Upcoming when movie Watchlist or watched eligibility changes', async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

    await invalidateMediaActionQueries(queryClient, 'watchlist', { ...movie, watchlist: true });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: upcomingQueryKeys.root });

    invalidate.mockClear();
    await invalidateMediaActionQueries(queryClient, 'watched', { ...movie, watched: true });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: upcomingQueryKeys.root });
  });

  it('refreshes TV progress and Continue Watching for TV tracking changes', async () => {
    const queryClient = new QueryClient();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue();

    await invalidateMediaActionQueries(queryClient, 'liked', { ...movie, media_type: 'tv', liked: true });

    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.inProgressTvRoot });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.tvProgress });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: upcomingQueryKeys.root });
  });
});
