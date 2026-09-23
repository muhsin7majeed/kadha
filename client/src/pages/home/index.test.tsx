import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { DEFAULT_HOME_PREFERENCES } from '@/features/home/home-defaults';
import type { HomePreferences } from '@/features/home/home.types';
import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  preferences: null as HomePreferences | null,
  isLoading: false,
  error: null as Error | null,
  refetch: vi.fn(),
  continueSection: vi.fn(() => <div>Continue section</div>),
  watchlistSection: vi.fn(() => <div>Watchlist section</div>),
  recommendationSection: vi.fn(() => <div>Recommendation section</div>),
  trendingMoviesSection: vi.fn(() => <div>Trending movies section</div>),
  trendingTvSection: vi.fn(() => <div>Trending TV section</div>),
}));

vi.mock('@/features/home/api/use-home-preferences', () => ({
  default: () => ({
    data: mocks.isLoading ? undefined : mocks.preferences ?? DEFAULT_HOME_PREFERENCES,
    isLoading: mocks.isLoading,
    error: mocks.error,
    refetch: mocks.refetch,
  }),
}));
vi.mock('@/features/home/components/continue-watching-home-section', () => ({ default: mocks.continueSection }));
vi.mock('@/features/home/components/watchlist-home-section', () => ({ default: mocks.watchlistSection }));
vi.mock('@/features/home/components/recommendations-home-section', () => ({ default: mocks.recommendationSection }));
vi.mock('@/features/discovery/components/trending-movies', () => ({ default: mocks.trendingMoviesSection }));
vi.mock('@/features/discovery/components/trending-tvs', () => ({ default: mocks.trendingTvSection }));

import Home from '.';

const renderHome = () =>
  renderWithProviders(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );

describe('Home', () => {
  beforeEach(() => {
    mocks.preferences = structuredClone(DEFAULT_HOME_PREFERENCES);
    mocks.isLoading = false;
    mocks.error = null;
    mocks.refetch.mockReset();
    mocks.continueSection.mockClear();
    mocks.watchlistSection.mockClear();
    mocks.recommendationSection.mockClear();
    mocks.trendingMoviesSection.mockClear();
    mocks.trendingTvSection.mockClear();
  });

  it('renders the default sections in decision-first order', () => {
    renderHome();

    const content = screen.getByTestId('home-sections');
    expect(content.children[0]).toHaveTextContent('Continue section');
    expect(content.children[1]).toHaveTextContent('Watchlist section');
    expect(content.children[2]).toHaveTextContent('Recommendation section');
    expect(content.children[3]).toHaveTextContent('Trending movies section');
    expect(content.children[4]).toHaveTextContent('Trending TV section');
  });

  it('uses saved order and does not mount hidden sections', () => {
    mocks.preferences = {
      version: 1,
      items: [
        { id: 'trending-tv', visible: true },
        { id: 'watchlist', visible: false },
        { id: 'continue-watching', visible: true },
        { id: 'recommendations', visible: false },
        { id: 'trending-movies', visible: true },
      ],
    };

    renderHome();

    const content = screen.getByTestId('home-sections');
    expect(content.children[0]).toHaveTextContent('Trending TV section');
    expect(content.children[1]).toHaveTextContent('Continue section');
    expect(content.children[2]).toHaveTextContent('Trending movies section');
    expect(mocks.watchlistSection).not.toHaveBeenCalled();
    expect(mocks.recommendationSection).not.toHaveBeenCalled();
  });

  it('waits for synced preferences before mounting section queries', () => {
    mocks.preferences = null;
    mocks.isLoading = true;

    renderHome();

    expect(screen.getByRole('status')).toHaveTextContent('Loading your Home');
    expect(mocks.continueSection).not.toHaveBeenCalled();
    expect(mocks.watchlistSection).not.toHaveBeenCalled();
  });
});
