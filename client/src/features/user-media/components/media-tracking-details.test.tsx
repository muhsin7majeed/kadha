import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { MediaMeta } from '@/types/common';
import type { UserMediaPayload } from '../user-media.types';
import buildUserMediaPayload from '../utils/build-user-media-payload';
import { hasMediaTrackingDetails } from '../utils/media-tracking-details';
import MediaTrackingDetails from './media-tracking-details';
import MediaTrackingDetailsDialog from './media-tracking-details-dialog';
import MediaTrackingSection from './media-tracking-section';

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/features/user-media/api/use-add-to-liked', () => ({
  default: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/features/user-media/api/use-add-to-watched', () => ({
  default: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('@/features/user-media/api/use-add-to-watch-list', () => ({
  default: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const createPayload = (overrides: Partial<UserMediaPayload> = {}): UserMediaPayload => ({
  adult: false,
  genre_ids: [18],
  media_id: 1,
  media_type: 'movie',
  poster_path: '/poster.jpg',
  release_date: '2025-01-01',
  title: 'Example Movie',
  vote_average: 8,
  vote_count: 100,
  ...overrides,
});

describe('MediaTrackingDetails', () => {
  it('recognizes details only when they belong to an active tracking state', () => {
    expect(hasMediaTrackingDetails({ liked: true, likedNote: 'A favorite.' })).toBe(true);
    expect(hasMediaTrackingDetails({ watched: true, watchedOn: '2026-08-20' })).toBe(true);
    expect(hasMediaTrackingDetails({ watchlist: false, watchlistNote: 'Saved for later.' })).toBe(false);
    expect(hasMediaTrackingDetails({ liked: true })).toBe(false);
  });

  it('shows all active personal details and exposes per-action editing', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const media: MediaMeta = {
      liked: true,
      watched: true,
      watchlist: true,
      rating: 9,
      watchedOn: '2026-08-20',
      likedNote: 'Beautiful cinematography.',
      watchedNote: 'Revisit the final scene.',
      watchlistNote: 'Recommended by a friend.',
    };

    renderWithProviders(<MediaTrackingDetails media={media} onEdit={onEdit} />);

    expect(screen.getByText('Only visible to you')).toBeInTheDocument();
    expect(screen.getByText('4.5 out of 5')).toBeInTheDocument();
    expect(screen.getByText('20 August 2026')).toBeInTheDocument();
    expect(screen.getByText('Beautiful cinematography.')).toBeInTheDocument();
    expect(screen.getByText('Revisit the final scene.')).toBeInTheDocument();
    expect(screen.getByText('Recommended by a friend.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit watched details' }));

    expect(onEdit).toHaveBeenCalledWith('watched');
  });

  it('opens editing above the personal-details dialog without closing it', async () => {
    const user = userEvent.setup();
    const trackingState = createPayload({ watchlist: true, watchlistNote: 'Watch before the sequel.' });
    const media = buildUserMediaPayload(trackingState);

    renderWithProviders(<MediaTrackingDetailsDialog media={media} trackingState={trackingState} />);

    await user.click(screen.getByRole('button', { name: 'View personal tracking details' }));

    expect(screen.getByRole('dialog', { name: 'Your tracking' })).toBeInTheDocument();
    expect(screen.getByText('Watch before the sequel.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit watchlist details' }));

    expect(screen.getByText('Your tracking').closest('[role="dialog"]')).toHaveAttribute('data-state', 'open');
    expect(screen.getByRole('dialog', { name: 'Add to watchlist' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByRole('dialog', { name: 'Your tracking' })).toBeInTheDocument();
  });

  it('shows the detail-page section when the mutation payload omits tracking flags', () => {
    const trackingState = createPayload({ liked: true, likedNote: 'Worth revisiting.' });
    const media = buildUserMediaPayload(trackingState);

    expect(media.liked).toBeUndefined();

    renderWithProviders(<MediaTrackingSection media={media} trackingState={trackingState} />);

    expect(screen.getByRole('heading', { name: 'Your tracking' })).toBeInTheDocument();
    expect(screen.getByText('Worth revisiting.')).toBeInTheDocument();
  });
});
