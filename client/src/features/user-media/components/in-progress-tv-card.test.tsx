import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import type { MediaCardModel } from '@/features/media/media-card-model';
import type { TvInProgressItem } from '@/features/user-media/user-media.types';
import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  markNext: vi.fn(),
}));

vi.mock('@/components/media-card/media-actions', () => ({
  default: ({ media, presentation }: { media: MediaCardModel; presentation?: string }) => (
    <button type="button">{presentation} actions for {media.title}</button>
  ),
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

const renderCard = (cardItem = item, variant: 'page' | 'carousel' = 'page') =>
  renderWithProviders(
    <MemoryRouter>
      <InProgressTvCard item={cardItem} variant={variant} />
    </MemoryRouter>,
  );

describe('InProgressTvCard', () => {
  it('prioritizes details navigation, next episode, progress, and the primary action', async () => {
    const user = userEvent.setup();
    renderCard();

    expect(screen.getByRole('link', { name: 'Example Show (2020)' })).toHaveAttribute(
      'href',
      '/app/media/tv/1',
    );
    expect(screen.getByText('S1 E2 · Next episode')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: '1 of 2 aired episodes watched' }),
    ).toHaveAttribute('aria-valuetext', '1 of 2 aired episodes watched');
    expect(screen.getByText('1 of 2 aired episodes watched')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'menu actions for Example Show' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Mark S1 E2 watched' }));
    expect(mocks.markNext).toHaveBeenCalledTimes(1);
  });

  it('renders caught-up shows without a mark-next action', () => {
    renderCard({
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
    expect(screen.queryByRole('button', { name: /Mark .* watched/ })).not.toBeInTheDocument();
  });

  it('supports the compact Home carousel presentation', () => {
    renderCard(item, 'carousel');

    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'menu actions for Example Show' })).toBeInTheDocument();
  });
});
