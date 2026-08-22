import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ViewingInsights } from '@/features/insights/insights.types';
import type { User } from '@/features/user/user.types';
import { renderWithProviders } from '@/test/render';
import { DataPrivacy, UserRole } from '@/types/common';
import ViewingOverview from '.';

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useViewingInsights: vi.fn(),
}));

vi.mock('@/features/auth/use-auth', () => ({
  useAuth: mocks.useAuth,
}));

vi.mock('@/features/insights/api/use-viewing-insights', () => ({
  default: mocks.useViewingInsights,
}));

const owner: User = {
  id: 'user-1',
  username: 'movie-fan',
  role: UserRole.User,
  profilePrivacy: DataPrivacy.OnlyMe,
  watchedPrivacy: DataPrivacy.OnlyMe,
  likedPrivacy: DataPrivacy.OnlyMe,
  watchlistPrivacy: DataPrivacy.OnlyMe,
  watchRegion: 'US',
};

const insights: ViewingInsights = {
  schemaVersion: 1,
  scope: { period: 'all', mediaType: 'all', basis: 'CURRENT_TRACKED_STATE' },
  summary: {
    watchedTitleCount: 12,
    movieCount: 8,
    tvSeriesCount: 4,
    watchedEpisodeCount: 23,
    personalRating: { average: 8.4, sampleSize: 5 },
  },
  viewingSignature: {
    status: 'AVAILABLE',
    topGenre: {
      id: '18',
      label: 'Drama',
      rank: 1,
      value: 7,
      unit: 'titles',
      denominator: 12,
      share: 7 / 12,
      sampleSize: 12,
    },
    topMovieDirector: null,
    topTvCreator: null,
    topCastMember: null,
  },
  rankings: {
    genres: [
      {
        id: '18',
        label: 'Drama',
        rank: 1,
        value: 7,
        unit: 'titles',
        denominator: 12,
        share: 7 / 12,
        sampleSize: 12,
      },
    ],
    cast: [],
    movieDirectors: [],
    tvCreators: [],
    likedGenres: [],
    highestRatedGenres: [],
  },
  distributions: { mediaTypes: [], releaseDecades: [], originalLanguages: [] },
  coverage: {
    eligibleTitleCount: 12,
    genres: { coveredTitleCount: 12, ratio: 1, status: 'COMPLETE' },
    credits: { coveredTitleCount: 9, ratio: 0.75, status: 'PARTIAL' },
    runtime: { coveredTitleCount: 8, ratio: 2 / 3, status: 'PARTIAL' },
  },
  methodology: {
    genreSharesOverlap: true,
    castBillingLimit: 10,
    titleCountingMode: 'DISTINCT_TITLES',
    tvPeopleWeighting: 'ONE_PER_SERIES',
  },
  computedAt: '2026-08-22T10:00:00.000Z',
};

const renderOverview = (username = owner.username) =>
  renderWithProviders(
    <MemoryRouter initialEntries={[`/app/profile/${username}/overview`]}>
      <Routes>
        <Route path="/app/profile/:username/overview" element={<ViewingOverview />} />
      </Routes>
    </MemoryRouter>,
  );

describe('ViewingOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({ status: 'authenticated', user: owner });
    mocks.useViewingInsights.mockReturnValue({
      data: insights,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it('renders exact accessible viewing values and partial metadata coverage', () => {
    renderOverview();

    expect(screen.getByRole('heading', { name: 'Viewing overview' })).toBeInTheDocument();
    expect(screen.getByText('You gravitate toward Drama.')).toBeInTheDocument();
    expect(screen.getByText('8.4')).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: '1. Drama, 7 titles' })).toBeInTheDocument();
    expect(
      screen.getByText('Credits are ready for 9 of 12 watched titles. Other totals remain complete.'),
    ).toBeInTheDocument();
    expect(screen.getByText('You also have 23 episodes marked watched.')).toBeInTheDocument();
  });

  it('changes the media scope without changing routes', async () => {
    const user = userEvent.setup();
    renderOverview();

    await user.click(screen.getByRole('radio', { name: 'Movies' }));

    expect(mocks.useViewingInsights).toHaveBeenLastCalledWith('movie', true);
  });

  it('does not request or render owner insights on another user route', () => {
    renderOverview('someone-else');

    expect(mocks.useViewingInsights).toHaveBeenCalledWith('all', false);
    expect(screen.queryByRole('heading', { name: 'Viewing overview' })).not.toBeInTheDocument();
  });
});
