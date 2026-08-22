import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { UserMediaPayload } from '@/features/user-media/user-media.types';
import MediaTrackingDialog from './media-tracking-dialog';

const mutationMocks = vi.hoisted(() => ({
  liked: vi.fn(),
  watched: vi.fn(),
  watchlist: vi.fn(),
}));

vi.mock('@/features/user-media/api/use-add-to-liked', () => ({
  default: () => ({
    mutateAsync: mutationMocks.liked,
    isPending: false,
  }),
}));

vi.mock('@/features/user-media/api/use-add-to-watched', () => ({
  default: () => ({
    mutateAsync: mutationMocks.watched,
    isPending: false,
  }),
}));

vi.mock('@/features/user-media/api/use-add-to-watch-list', () => ({
  default: () => ({
    mutateAsync: mutationMocks.watchlist,
    isPending: false,
  }),
}));

const createPayload = (overrides: Partial<UserMediaPayload> = {}): UserMediaPayload => ({
  adult: false,
  backdrop_path: '/backdrop.jpg',
  genre_ids: [18],
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
  ...overrides,
});

describe('MediaTrackingDialog', () => {
  beforeEach(() => {
    mutationMocks.liked.mockResolvedValue({});
    mutationMocks.watched.mockResolvedValue({});
    mutationMocks.watchlist.mockResolvedValue({});
    vi.clearAllMocks();
  });

  it('submits watched details with a 5-star half-step rating', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onSaved = vi.fn();

    renderWithProviders(
      <MediaTrackingDialog
        action="watched"
        context="detail-pre-action"
        media={createPayload()}
        currentState={{ liked: false, watched: false }}
        open
        onOpenChange={onOpenChange}
        onSaved={onSaved}
      />,
    );

    await user.clear(screen.getByLabelText('Watched on'));
    await user.type(screen.getByLabelText('Watched on'), '2026-01-15');
    await user.click(screen.getByRole('radio', { name: '4.5 out of 5 stars' }));
    await user.type(screen.getByLabelText('Private note'), 'Great pacing.');
    await user.click(screen.getByRole('checkbox', { name: 'Like this too' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mutationMocks.watched).toHaveBeenCalledWith(
      expect.objectContaining({
        watched: true,
        liked: true,
        rating: 9,
        watchedOn: '2026-01-15',
        watchedNote: 'Great pacing.',
      }),
    );
    expect(onSaved).toHaveBeenCalledWith({
      rating: 9,
      watchedOn: '2026-01-15',
      watchedNote: 'Great pacing.',
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not submit unknown card tracking fields when unchanged', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <MediaTrackingDialog
        action="watchlist"
        context="card-post-action"
        media={createPayload({ watchlist: true })}
        currentState={{ watchlist: true }}
        open
        onOpenChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(mutationMocks.watchlist).toHaveBeenCalledWith(
      expect.not.objectContaining({
        watchlistNote: expect.anything(),
        rating: expect.anything(),
      }),
    );
  });
});
