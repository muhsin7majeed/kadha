import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MediaActions from '@/components/media-card/media-actions';
import { renderWithProviders } from '@/test/render';
import type { MediaMeta } from '@/types/common';
import type { UserMediaPayload } from '../user-media.types';
import buildUserMediaPayload from '../utils/build-user-media-payload';
import { hasActiveMediaTracking, hasMediaTrackingDetails } from '../utils/media-tracking-details';
import MediaTrackingDetails from './media-tracking-details';
import MediaTrackingDetailsDialog from './media-tracking-details-dialog';
import MediaTrackingSection from './media-tracking-section';

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/features/collections/components/add-to-collection-dialog', () => ({
  default: () => null,
}));

const mutationMocks = vi.hoisted(() => ({
  liked: vi.fn(),
  watched: vi.fn(),
  watchlist: vi.fn(),
}));

vi.mock('@/features/user-media/api/use-add-to-liked', () => ({
  default: () => ({ mutateAsync: mutationMocks.liked, isPending: false }),
}));

vi.mock('@/features/user-media/api/use-add-to-watched', () => ({
  default: () => ({ mutateAsync: mutationMocks.watched, isPending: false }),
}));

vi.mock('@/features/user-media/api/use-add-to-watch-list', () => ({
  default: () => ({ mutateAsync: mutationMocks.watchlist, isPending: false }),
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
  beforeEach(() => {
    mutationMocks.liked.mockResolvedValue({});
    mutationMocks.watched.mockResolvedValue({});
    mutationMocks.watchlist.mockResolvedValue({});
    vi.clearAllMocks();
  });

  it('recognizes details only when they belong to an active tracking state', () => {
    expect(hasActiveMediaTracking({ liked: true })).toBe(true);
    expect(
      hasActiveMediaTracking({
        liked: false,
        watched: false,
        watchlist: false,
      }),
    ).toBe(false);
    expect(hasMediaTrackingDetails({ liked: true, likedNote: 'A favorite.' })).toBe(true);
    expect(hasMediaTrackingDetails({ watched: true, watchedOn: '2026-08-20' })).toBe(true);
    expect(
      hasMediaTrackingDetails({
        watchlist: false,
        watchlistNote: 'Saved for later.',
      }),
    ).toBe(false);
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

  it('keeps management available without details and uses one dialog at a time', async () => {
    const user = userEvent.setup();
    const trackingState = createPayload({ watchlist: true });
    const media = buildUserMediaPayload(trackingState);

    renderWithProviders(<MediaTrackingDetailsDialog media={media} trackingState={trackingState} />);

    await user.click(screen.getByRole('button', { name: 'Manage personal tracking' }));

    expect(screen.getByRole('dialog', { name: 'Your tracking' })).toBeInTheDocument();
    expect(screen.getByText('Add a rating, watched date, or private note.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit watchlist details' }));

    expect(screen.queryByRole('dialog', { name: 'Your tracking' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Add to watchlist' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByRole('dialog', { name: 'Your tracking' })).toBeInTheDocument();
  });

  it('opens management instead of removing watched status from a media card', async () => {
    const user = userEvent.setup();
    const trackingState = createPayload({ watched: true });

    renderWithProviders(<MediaActions media={trackingState} />);

    await user.click(screen.getByRole('button', { name: 'Manage watched tracking' }));

    expect(mutationMocks.watched).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Your tracking' })).toBeInTheDocument();
  });

  it('requires confirmation before removing watched status', async () => {
    const user = userEvent.setup();
    const trackingState = createPayload({
      watched: true,
      watchedOn: '2026-08-20',
      watchedNote: 'Remember this.',
    });
    const media = buildUserMediaPayload(trackingState);

    renderWithProviders(<MediaTrackingDetailsDialog media={media} trackingState={trackingState} />);

    await user.click(screen.getByRole('button', { name: 'Manage personal tracking' }));
    await user.click(screen.getByRole('button', { name: 'Mark unwatched' }));

    expect(screen.queryByRole('dialog', { name: 'Your tracking' })).not.toBeInTheDocument();
    expect(screen.getByRole('alertdialog', { name: 'Mark this title unwatched?' })).toBeInTheDocument();
    expect(screen.getByText(/watched date, rating, and private notes will stay saved/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(await screen.findByRole('dialog', { name: 'Your tracking' })).toBeInTheDocument();
    expect(mutationMocks.watched).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Mark unwatched' }));
    await user.click(screen.getByRole('button', { name: 'Mark unwatched' }));

    expect(mutationMocks.watched).toHaveBeenCalledWith(expect.objectContaining({ watched: false }));
    expect(
      screen.getByRole('alertdialog', {
        name: 'Mark this title unwatched?',
        hidden: true,
      }),
    ).toHaveAttribute('data-state', 'closed');
  });

  it('repopulates saved liked details when the editor is reopened', async () => {
    const user = userEvent.setup();
    const trackingState = createPayload({ liked: true });
    const media = buildUserMediaPayload(trackingState);

    renderWithProviders(<MediaTrackingDetailsDialog media={media} trackingState={trackingState} />);

    await user.click(screen.getByRole('button', { name: 'Manage personal tracking' }));
    await user.click(screen.getByRole('button', { name: 'Edit liked details' }));
    await user.click(screen.getByRole('radio', { name: '4.5 out of 5 stars' }));
    await user.type(screen.getByLabelText('Private note'), 'Still a favorite.');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('dialog', { name: 'Your tracking' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit liked details' }));

    expect(screen.getByRole('radio', { name: '4.5 out of 5 stars' })).toBeChecked();
    expect(screen.getByLabelText('Private note')).toHaveValue('Still a favorite.');
  });

  it('repopulates saved watched details when the detail-page editor is reopened', async () => {
    const user = userEvent.setup();
    const trackingState = createPayload({ watched: true });
    const media = buildUserMediaPayload(trackingState);

    renderWithProviders(<MediaTrackingSection media={media} trackingState={trackingState} />);

    await user.click(screen.getByRole('button', { name: 'Edit watched details' }));
    await user.clear(screen.getByLabelText('Watched on'));
    await user.type(screen.getByLabelText('Watched on'), '2026-08-19');
    await user.click(screen.getByRole('radio', { name: '4 out of 5 stars' }));
    await user.type(screen.getByLabelText('Private note'), 'Watch this scene again.');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await user.click(screen.getByRole('button', { name: 'Edit watched details' }));

    expect(screen.getByLabelText('Watched on')).toHaveValue('2026-08-19');
    expect(screen.getByRole('radio', { name: '4 out of 5 stars' })).toBeChecked();
    expect(screen.getByLabelText('Private note')).toHaveValue('Watch this scene again.');
  });

  it('shows the detail-page section when the mutation payload omits tracking flags', () => {
    const trackingState = createPayload({
      liked: true,
      likedNote: 'Worth revisiting.',
    });
    const media = buildUserMediaPayload(trackingState);

    expect(media.liked).toBeUndefined();

    renderWithProviders(<MediaTrackingSection media={media} trackingState={trackingState} />);

    expect(screen.getByRole('heading', { name: 'Your tracking' })).toBeInTheDocument();
    expect(screen.getByText('Worth revisiting.')).toBeInTheDocument();
  });

  it('shows the detail-page section for active tracking without saved details', () => {
    const trackingState = createPayload({ watched: true });
    const media = buildUserMediaPayload(trackingState);

    renderWithProviders(<MediaTrackingSection media={media} trackingState={trackingState} />);

    expect(screen.getByRole('heading', { name: 'Your tracking' })).toBeInTheDocument();
    expect(screen.getByText('Add a rating, watched date, or private note.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit watched details' })).toBeInTheDocument();
  });

  it('hides tracking management for an untracked title', () => {
    const trackingState = createPayload({
      liked: false,
      watched: false,
      watchlist: false,
    });
    const media = buildUserMediaPayload(trackingState);
    const { rerender } = renderWithProviders(
      <MediaTrackingDetailsDialog media={media} trackingState={trackingState} />,
    );

    expect(screen.queryByRole('button', { name: 'Manage personal tracking' })).not.toBeInTheDocument();

    rerender(<MediaTrackingSection media={media} trackingState={trackingState} />);

    expect(screen.queryByRole('heading', { name: 'Your tracking' })).not.toBeInTheDocument();
  });
});
