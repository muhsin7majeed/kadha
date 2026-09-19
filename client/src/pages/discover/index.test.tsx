import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({ mediaType: 'All' as 'All' | 'Movie' | 'TV' }));

vi.mock('@/atoms/media-type', () => ({ useMediaTypeValue: () => mocks.mediaType }));
vi.mock('@/components/media-type-filter', () => ({ default: () => <div>Media filter</div> }));
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
    mocks.mediaType = 'All';
  });

  it('shows every discovery feed for the All filter', () => {
    renderWithProviders(<Discover />);

    expect(screen.getByRole('heading', { name: 'Discover' })).toBeInTheDocument();
    expect(screen.getByText('Trending Movies')).toBeInTheDocument();
    expect(screen.getByText('Trending TV')).toBeInTheDocument();
    expect(screen.getByText('In Theaters')).toBeInTheDocument();
    expect(screen.getByText('Airing Now')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Movies')).toBeInTheDocument();
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
