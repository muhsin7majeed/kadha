import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import type { MediaCardModel } from '@/features/media/media-card-model';
import { renderWithProviders } from '@/test/render';

vi.mock('../media-card', () => ({ default: ({ media }: { media: MediaCardModel }) => <div>{media.title}</div> }));

import MediaCarousel from '.';

const media: MediaCardModel = {
  adult: false,
  genre_ids: [],
  media_id: 1,
  media_type: 'movie',
  poster_path: null,
  release_date: '2024-01-01',
  title: 'Example Movie',
  vote_average: 8,
  vote_count: 100,
};

describe('MediaCarousel', () => {
  it('renders normalized media and an optional full-list destination', () => {
    renderWithProviders(
      <MemoryRouter>
        <MediaCarousel title="From Your Watchlist" data={[media]} viewAllTo="/app/watchlist" />
      </MemoryRouter>,
    );

    expect(screen.getByText('Example Movie')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all' })).toHaveAttribute('href', '/app/watchlist');
  });
});
