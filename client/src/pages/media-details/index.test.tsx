import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MovieDetailsWithMeta } from '@/features/media/media.types';
import { renderWithProviders } from '@/test/render';
import MediaDetails from './index';

const mocks = vi.hoisted(() => ({
  refetch: vi.fn(),
}));

vi.mock('@/features/media/api/use-media-details', () => ({
  default: () => ({
    data: {
      adult: false,
      belongs_to_collection: null,
      budget: 100,
      genres: [],
      homepage: null,
      imdb_id: null,
      liked: false,
      media_id: 1,
      media_type: 'movie',
      original_language: 'en',
      original_title: 'Example Movie',
      overview: 'Overview',
      popularity: 10,
      poster_path: null,
      production_companies: [],
      production_countries: [],
      release_date: '2025-01-01',
      revenue: 200,
      runtime: 120,
      spoken_languages: [],
      status: 'Released',
      tagline: null,
      title: 'Example Movie',
      video: false,
      vote_average: 8,
      vote_count: 100,
      watched: false,
      watchlist: false,
    } satisfies MovieDetailsWithMeta,
    isError: false,
    isFetching: false,
    isLoading: false,
    refetch: mocks.refetch,
  }),
}));

vi.mock('@/features/user-media/api/use-mark-next-episode-watched', () => ({
  default: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/features/user-media/api/use-tv-progress', () => ({
  default: () => ({ data: undefined, isLoading: false }),
}));

vi.mock('@/features/user-media/components/tv-episode-progress-dialog', () => ({
  default: () => null,
}));

vi.mock('@/features/user-media/components/media-tracking-section', () => ({
  default: () => null,
}));

vi.mock('@/features/user-media/components/movie-watch-history-section', () => ({
  default: () => null,
}));

vi.mock('./components/hero-section', () => ({
  default: ({ onBack }: { onBack?: () => void }) => (
    <div>
      Hero section
      {onBack && <button onClick={onBack}>Back</button>}
    </div>
  ),
}));

vi.mock('./components/overview-section', () => ({
  default: () => null,
}));

vi.mock('./components/movie-info', () => ({
  default: () => null,
}));

vi.mock('./components/production-info', () => ({
  default: () => null,
}));

vi.mock('./components/recommendations-section', () => ({
  default: () => null,
}));

vi.mock('./components/watch-providers-section', () => ({
  default: () => null,
}));

const LocationProbe = () => {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
};

const renderMediaDetails = (initialEntries: string[], initialIndex = initialEntries.length - 1) =>
  renderWithProviders(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <Routes>
        <Route path="/app/media/:mediaType/:id" element={<MediaDetails />} />
        <Route path="/app/watchlist" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );

describe('MediaDetails navigation', () => {
  beforeEach(() => {
    mocks.refetch.mockReset();
  });

  it('returns to the previous in-app URL from a successful private detail view', async () => {
    const user = userEvent.setup();
    renderMediaDetails(['/app/watchlist?sort=title&page=2', '/app/media/movie/1']);

    await user.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/app/watchlist?sort=title&page=2');
  });

  it('does not show Back for a directly opened private detail URL', () => {
    renderMediaDetails(['/app/media/movie/1']);

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });
});
