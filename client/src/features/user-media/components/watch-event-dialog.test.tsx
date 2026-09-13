import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { UserMediaPayload, WatchEvent } from '../user-media.types';
import WatchEventDialog from './watch-event-dialog';

const mocks = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn() }));

vi.mock('../api/use-watch-event-mutations', () => ({
  useCreateWatchEvent: () => ({ mutateAsync: mocks.create, isPending: false }),
  useUpdateWatchEvent: () => ({ mutateAsync: mocks.update, isPending: false }),
}));

const media: UserMediaPayload = {
  adult: false,
  genre_ids: [18],
  media_id: 77,
  media_type: 'tv',
  poster_path: null,
  release_date: '2025-01-01',
  title: 'Example Series',
  vote_average: 8,
  vote_count: 100,
};

const episodeEvent: WatchEvent = {
  id: 'episode-watch',
  media_id: 77,
  media_type: 'tv',
  seasonNumber: 2,
  episodeNumber: 4,
  episodeId: 7004,
  watchedAt: '2026-09-13T10:00:00.000Z',
  watchedOn: '2026-09-12',
  rating: 7,
  note: 'A strong episode.',
  createdAt: '2026-09-13T10:00:00.000Z',
  updatedAt: '2026-09-13T10:00:00.000Z',
};

describe('WatchEventDialog episode editing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.update.mockResolvedValue({ events: [], watchCount: 1, lastWatchedAt: null, lastWatchedOn: null });
  });

  it('initializes and explains an episode-specific rating', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <WatchEventDialog event={episodeEvent} media={media} open onOpenChange={vi.fn()} />,
    );

    const dialog = screen.getByRole('dialog', { name: 'Edit watch' });
    expect(within(dialog).getByText('This rating belongs to this episode watch.')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Private watch note')).toHaveValue('A strong episode.');
    expect(within(dialog).getByRole('radio', { name: '3.5 out of 5 stars' })).toHaveAttribute('aria-checked', 'true');

    await user.click(within(dialog).getByRole('radio', { name: '4 out of 5 stars' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
    expect(mocks.update).toHaveBeenCalledWith({
      eventId: 'episode-watch',
      payload: { watchedOn: '2026-09-12', note: 'A strong episode.', rating: 8 },
    });
  });
});
