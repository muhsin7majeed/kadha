import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import type { TvInProgressItem } from '@/features/user-media/user-media.types';
import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  markNext: vi.fn(),
}));

vi.mock('@/components/media-card', () => ({
  default: ({ width }: { width?: string }) => <div data-testid="media-card" data-width={width} />,
}));

vi.mock('@/features/user-media/api/use-mark-next-episode-watched', () => ({
  default: () => ({ isPending: false, mutate: mocks.markNext }),
}));

import InProgressTvCard from './in-progress-tv-card';

const item: TvInProgressItem = {
  media_id: 1,
  media_type: 'tv',
  title: 'Example Show',
  poster_path: null,
  backdrop_path: null,
  vote_average: 8,
  vote_count: 100,
  adult: false,
  genre_ids: [],
  release_date: '2020-01-01',
  tvProgress: {
    status: 'in_progress',
    watchedEpisodeCount: 1,
    totalAiredEpisodeCount: 2,
    nextEpisode: {
      seasonNumber: 1,
      episodeNumber: 2,
      episodeId: 2,
      name: 'Next episode',
      airDate: '2020-01-08',
    },
    lastWatchedAt: '2020-01-02T00:00:00.000Z',
  },
};

const renderCard = (showDetailsAction?: boolean, cardItem = item) =>
  renderWithProviders(
    <MemoryRouter>
      <InProgressTvCard item={cardItem} showDetailsAction={showDetailsAction} />
    </MemoryRouter>,
  );

describe('InProgressTvCard', () => {
  it('uses the full card width for the media card', () => {
    renderCard(false);

    expect(screen.getByTestId('media-card')).toHaveAttribute('data-width', '100%');
  });

  it('hides the details action for the Home preview', () => {
    renderCard(false);

    expect(screen.queryByRole('link', { name: 'Details' })).not.toBeInTheDocument();
  });

  it('shows the details action by default', () => {
    renderCard();

    expect(screen.getByRole('link', { name: 'Details' })).toBeInTheDocument();
  });

  it('renders caught-up shows without a mark-next action', () => {
    renderCard(true, {
      ...item,
      tvProgress: {
        ...item.tvProgress,
        status: 'caught_up',
        watchedEpisodeCount: 2,
        totalAiredEpisodeCount: 2,
        nextEpisode: null,
      },
    });

    expect(screen.getByText('Caught up')).toBeInTheDocument();
    expect(screen.getByText('No aired episodes left')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Mark next/ })).not.toBeInTheDocument();
  });
});
