import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  inProgress: vi.fn(),
  recommendations: vi.fn(),
  watchlist: vi.fn(),
}));

vi.mock('@/features/user-media/api/use-in-progress-tv', () => ({ default: mocks.inProgress }));
vi.mock('@/features/recommendations/api/use-recommendations', () => ({ default: mocks.recommendations }));
vi.mock('@/features/user-media/api/use-watch-list', () => ({ default: mocks.watchlist }));
vi.mock('@/features/user-media/components/in-progress-tv-card', () => ({
  default: ({ variant }: { variant?: string }) => <div>Progress card: {variant}</div>,
}));
vi.mock('@/components/media-carousel', () => ({
  default: ({ title, viewAllTo }: { title: string; viewAllTo?: string }) => <a href={viewAllTo}>{title}</a>,
}));

import ContinueWatchingHomeSection from './continue-watching-home-section';
import RecommendationsHomeSection from './recommendations-home-section';
import WatchlistHomeSection from './watchlist-home-section';

const emptyQuery = {
  data: { data: [] },
  error: null,
  isFetching: false,
  isLoading: false,
  refetch: vi.fn(),
};

const renderSection = (section: React.ReactElement) =>
  renderWithProviders(<MemoryRouter>{section}</MemoryRouter>);

describe('personal Home sections', () => {
  it('omits successful empty personal sections completely', () => {
    mocks.inProgress.mockReturnValue(emptyQuery);
    mocks.watchlist.mockReturnValue(emptyQuery);
    mocks.recommendations.mockReturnValue({
      ...emptyQuery,
      data: { data: { items: [], status: 'NO_SIGNALS' } },
    });

    const { rerender } = renderSection(<ContinueWatchingHomeSection />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();

    rerender(<WatchlistHomeSection />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();

    rerender(<RecommendationsHomeSection />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('uses the compact card presentation for Continue Watching', () => {
    mocks.inProgress.mockReturnValue({
      ...emptyQuery,
      data: { data: [{ media_id: 1, media_type: 'tv' }] },
    });

    renderSection(<ContinueWatchingHomeSection />);

    expect(screen.getByText('Progress card: carousel')).toBeInTheDocument();
  });

  it('links previews to their full destinations', () => {
    const media = { media_id: 1, media_type: 'movie' };
    mocks.watchlist.mockReturnValue({ ...emptyQuery, data: { data: [media] } });
    mocks.recommendations.mockReturnValue({
      ...emptyQuery,
      data: { data: { items: [{ media }], status: 'READY' } },
    });

    const { rerender } = renderSection(<WatchlistHomeSection />);
    expect(screen.getByRole('link', { name: 'From Your Watchlist' })).toHaveAttribute('href', '/app/watchlist');

    rerender(<RecommendationsHomeSection />);
    expect(screen.getByRole('link', { name: 'For You' })).toHaveAttribute('href', '/app/recommendations');
  });

  it('shows a retry action for an enabled section failure', () => {
    mocks.watchlist.mockReturnValue({ ...emptyQuery, data: undefined, error: new Error('failed') });

    renderSection(<WatchlistHomeSection />);

    expect(screen.getByRole('heading', { name: 'From Your Watchlist' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
