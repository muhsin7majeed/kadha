import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { UserMediaPayload, WatchHistory } from '../user-media.types';
import MovieWatchHistorySection from './movie-watch-history-section';

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => children,
}));

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  delete: vi.fn(),
  history: null as WatchHistory | null,
  refetch: vi.fn(),
  update: vi.fn(),
}));

vi.mock('../api/use-watch-events', () => ({
  default: () => ({
    data: mocks.history,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: mocks.refetch,
  }),
}));

vi.mock('../api/use-watch-event-mutations', () => ({
  useCreateWatchEvent: () => ({ mutateAsync: mocks.create, isPending: false }),
  useDeleteWatchEvent: () => ({ mutateAsync: mocks.delete, isPending: false }),
  useUpdateWatchEvent: () => ({ mutateAsync: mocks.update, isPending: false }),
}));

const media: UserMediaPayload = {
  adult: false,
  genre_ids: [18],
  media_id: 44,
  media_type: 'movie',
  poster_path: '/poster.jpg',
  rating: 8,
  release_date: '2025-01-01',
  title: 'Example Movie',
  vote_average: 8,
  vote_count: 100,
};

const history: WatchHistory = {
  watchCount: 2,
  lastWatchedAt: '2026-08-21T10:00:00.000Z',
  lastWatchedOn: '2026-08-21',
  events: [
    {
      id: 'watch-2',
      media_id: 44,
      media_type: 'movie',
      seasonNumber: null,
      episodeNumber: null,
      episodeId: null,
      watchedAt: '2026-08-21T10:00:00.000Z',
      watchedOn: '2026-08-21',
      rating: null,
      note: 'The second viewing landed differently.',
      createdAt: '2026-08-21T10:00:00.000Z',
      updatedAt: '2026-08-21T10:00:00.000Z',
    },
    {
      id: 'watch-1',
      media_id: 44,
      media_type: 'movie',
      seasonNumber: null,
      episodeNumber: null,
      episodeId: null,
      watchedAt: '2026-08-20T10:00:00.000Z',
      watchedOn: '2026-08-20',
      rating: null,
      note: null,
      createdAt: '2026-08-20T10:00:00.000Z',
      updatedAt: '2026-08-20T10:00:00.000Z',
    },
  ],
};

describe('MovieWatchHistorySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.history = history;
    mocks.create.mockResolvedValue(history);
    mocks.update.mockResolvedValue(history);
    mocks.delete.mockResolvedValue(history);
  });

  it('shows repeat watches and edits one viewing without treating its rating as event-specific', async () => {
    const user = userEvent.setup();

    renderWithProviders(<MovieWatchHistorySection media={{ ...media, watched: true, watchCount: 2 }} />);

    expect(screen.getByText('Times watched')).toBeInTheDocument();
    expect(screen.getByText('Rewatch 1')).toBeInTheDocument();
    expect(screen.getByText('First watch')).toBeInTheDocument();
    expect(screen.getByText('The second viewing landed differently.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit rewatch 1' }));
    const dialog = screen.getByRole('dialog', { name: 'Edit watch' });

    expect(within(dialog).getByLabelText('Watched on')).toHaveValue('2026-08-21');
    expect(within(dialog).getByLabelText('Private watch note')).toHaveValue('The second viewing landed differently.');
    expect(within(dialog).getByText(/rating applies to the title overall/i)).toBeInTheDocument();

    await user.clear(within(dialog).getByLabelText('Private watch note'));
    await user.type(within(dialog).getByLabelText('Private watch note'), 'Updated rewatch note.');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(mocks.update).toHaveBeenCalledWith({
      eventId: 'watch-2',
      payload: {
        watchedOn: '2026-08-21',
        note: 'Updated rewatch note.',
        rating: 8,
      },
    });
  }, 10_000);

  it('confirms before permanently removing an individual watch', async () => {
    const user = userEvent.setup();

    renderWithProviders(<MovieWatchHistorySection media={{ ...media, watched: true, watchCount: 2 }} />);

    await user.click(screen.getByRole('button', { name: 'Remove first watch' }));

    expect(screen.getByRole('alertdialog', { name: 'Remove this watch?' })).toBeInTheDocument();
    expect(screen.getByText(/viewing date and its private note will be permanently removed/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove watch' }));

    expect(mocks.delete).toHaveBeenCalledWith('watch-1');
  });

  it('uses an explicit form to create the first watch', async () => {
    const user = userEvent.setup();
    mocks.history = { events: [], watchCount: 0, lastWatchedAt: null, lastWatchedOn: null };

    renderWithProviders(<MovieWatchHistorySection media={media} />);

    expect(screen.getByText('No watches logged yet')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Mark watched' }));

    const dialog = screen.getByRole('dialog', { name: 'Mark watched' });
    await user.type(within(dialog).getByLabelText('Private watch note'), 'First watch note.');
    await user.click(within(dialog).getByRole('button', { name: 'Mark watched' }));

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        media_id: 44,
        note: 'First watch note.',
        rating: 8,
        clientRequestId: expect.any(String),
      }),
    );
  });
});
