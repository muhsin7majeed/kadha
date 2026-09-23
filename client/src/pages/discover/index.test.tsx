import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  mediaType: 'All' as 'All' | 'Movie' | 'TV',
  setMediaType: vi.fn(),
}));

vi.mock('@/atoms/media-type', () => ({ useMediaType: () => [mocks.mediaType, mocks.setMediaType] }));
vi.mock('@/features/discovery/components/trending-movies', () => ({ default: () => <div>Trending Movies</div> }));
vi.mock('@/features/discovery/components/trending-tvs', () => ({ default: () => <div>Trending TV</div> }));
vi.mock('@/features/discovery/components/popular-movies', () => ({ default: () => <div>Popular Movies</div> }));
vi.mock('@/features/discovery/components/popular-tvs', () => ({ default: () => <div>Popular TV</div> }));
vi.mock('@/features/discovery/components/now-playing-movies', () => ({ default: () => <div>In Theaters</div> }));
vi.mock('@/features/discovery/components/on-the-air-tvs', () => ({ default: () => <div>Airing Now</div> }));
vi.mock('@/features/discovery/components/upcoming-movies', () => ({ default: () => <div>Upcoming Movies</div> }));
vi.mock('@/features/discovery/components/top-rated-movies', () => ({ default: () => <div>Top Rated Movies</div> }));
vi.mock('@/features/discovery/components/top-rated-tvs', () => ({ default: () => <div>Top Rated TV</div> }));

import Discover from '.';

describe('Discover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mediaType = 'All';
  });

  it('shows every discovery feed for the All filter', () => {
    renderWithProviders(<Discover />);

    expect(screen.getByRole('heading', { name: 'Discover' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
    expect(screen.getByText('Trending Movies')).toBeInTheDocument();
    expect(screen.getByText('Trending TV')).toBeInTheDocument();
    expect(screen.getByText('In Theaters')).toBeInTheDocument();
    expect(screen.getByText('Airing Now')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Movies')).toBeInTheDocument();
  });

  it('updates the persisted filter through the shared control', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Discover />);

    await user.click(screen.getByText('Movies'));

    expect(mocks.setMediaType).toHaveBeenCalledWith('Movie');
  });

  it('shows only TV feeds for the TV filter', () => {
    mocks.mediaType = 'TV';
    renderWithProviders(<Discover />);

    expect(screen.queryByText('Trending Movies')).not.toBeInTheDocument();
    expect(screen.getByText('Trending TV')).toBeInTheDocument();
    expect(screen.getByText('Popular TV')).toBeInTheDocument();
    expect(screen.getByText('Airing Now')).toBeInTheDocument();
    expect(screen.getByText('Top Rated TV')).toBeInTheDocument();
  });
});
