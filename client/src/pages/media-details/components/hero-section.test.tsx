import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MovieDetailsWithMeta, TvDetailsWithMeta } from '@/features/media/media.types';
import type { TvProgressResponse } from '@/features/user-media/user-media.types';
import { renderWithProviders } from '@/test/render';
import HeroSection from './hero-section';

const mutationMocks = vi.hoisted(() => ({
  createEvent: vi.fn(),
  liked: vi.fn(),
  updateEvent: vi.fn(),
  watched: vi.fn(),
  watchlist: vi.fn(),
}));

vi.mock('@/features/user-media/api/use-watch-events', () => ({
  default: () => ({
    data: { events: [], watchCount: 1, lastWatchedAt: '2026-08-20T10:00:00.000Z', lastWatchedOn: '2026-08-20' },
    isLoading: false,
  }),
}));

vi.mock('@/features/user-media/api/use-watch-event-mutations', () => ({
  useCreateWatchEvent: () => ({ mutateAsync: mutationMocks.createEvent, isPending: false }),
  useUpdateWatchEvent: () => ({ mutateAsync: mutationMocks.updateEvent, isPending: false }),
}));

vi.mock('@/features/collections/components/add-to-collection-dialog', () => ({
  default: () => null,
}));

vi.mock('@/features/user-media/api/use-add-to-liked', () => ({
  default: () => ({ mutateAsync: mutationMocks.liked, isPending: false }),
}));

vi.mock('@/features/user-media/api/use-add-to-watched', () => ({
  default: () => ({ mutateAsync: mutationMocks.watched, isPending: false }),
}));

vi.mock('@/features/user-media/api/use-add-to-watch-list', () => ({
  default: () => ({ mutateAsync: mutationMocks.watchlist, isPending: false }),
}));

const movie: MovieDetailsWithMeta = {
  adult: false,
  backdrop_path: null,
  belongs_to_collection: null,
  budget: 100,
  genres: [{ id: 18, name: 'Drama' }],
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
  watched: true,
  watchlist: false,
};

const tv: TvDetailsWithMeta = {
  adult: false,
  backdrop_path: null,
  created_by: [],
  episode_run_time: [45],
  first_air_date: '2025-01-01',
  genres: [{ id: 18, name: 'Drama' }],
  homepage: null,
  in_production: true,
  languages: ['en'],
  last_air_date: null,
  last_episode_to_air: null,
  media_id: 2,
  media_type: 'tv',
  name: 'Example Show',
  networks: [],
  next_episode_to_air: null,
  number_of_episodes: 10,
  number_of_seasons: 1,
  origin_country: ['US'],
  original_language: 'en',
  original_name: 'Example Show',
  overview: 'Overview',
  popularity: 10,
  poster_path: null,
  production_companies: [],
  production_countries: [],
  seasons: [],
  spoken_languages: [],
  status: 'Returning Series',
  still_path: null,
  tagline: null,
  type: 'Scripted',
  vote_average: 8,
  vote_count: 100,
  watched: true,
  watchlist: false,
};

const tvProgress: TvProgressResponse = {
  status: 'in_progress',
  watchedEpisodeCount: 1,
  totalAiredEpisodeCount: 2,
  nextEpisode: {
    seasonNumber: 1,
    episodeNumber: 2,
    episodeId: 102,
    name: 'Second Episode',
    airDate: '2025-01-08',
  },
  seasons: [],
};

describe('HeroSection watched action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens the rewatch form for an already watched movie', async () => {
    const user = userEvent.setup();

    renderWithProviders(<HeroSection data={movie} />);

    await user.click(screen.getByRole('button', { name: 'Log a rewatch' }));

    expect(mutationMocks.watched).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Log a rewatch' })).toBeInTheDocument();
  });

  it('keeps the mark-next-episode behavior for TV progress', async () => {
    const user = userEvent.setup();
    const onMarkNextEpisode = vi.fn();

    renderWithProviders(<HeroSection data={tv} tvProgress={tvProgress} onMarkNextEpisode={onMarkNextEpisode} />);

    await user.click(screen.getByRole('button', { name: 'Mark next episode' }));

    expect(onMarkNextEpisode).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog', { name: 'Your tracking' })).not.toBeInTheDocument();
  });
});
