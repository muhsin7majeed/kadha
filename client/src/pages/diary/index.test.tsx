import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import Diary from './index';

const mocks = vi.hoisted(() => ({
  useDiary: vi.fn(),
  useDiaryInsights: vi.fn(),
}));

vi.mock('@/features/user-media/api/use-diary', () => ({ default: mocks.useDiary }));
vi.mock('@/features/user-media/api/use-diary-insights', () => ({ default: mocks.useDiaryInsights }));

const response = {
  data: [
    {
      id: 'event-1',
      media_id: 101,
      media_type: 'movie',
      seasonNumber: null,
      episodeNumber: null,
      episodeId: null,
      watchedAt: '2026-09-13T12:00:00.000Z',
      watchedOn: '2026-09-13',
      rating: 8,
      note: 'Still excellent.',
      createdAt: '2026-09-13T12:00:00.000Z',
      updatedAt: '2026-09-13T12:00:00.000Z',
      title: 'A Test Film',
      original_title: 'A Test Film',
      overview: null,
      poster_path: null,
      backdrop_path: null,
      vote_average: 7,
      vote_count: 10,
      popularity: 1,
      adult: false,
      genre_ids: [],
      release_date: '2024-01-01',
      original_language: 'en',
      runtime: 120,
      status: 'Released',
    },
  ],
  summary: {
    totalEntries: 1,
    movieWatches: 1,
    episodeWatches: 0,
    uniqueTitles: 1,
    estimatedMinutes: 120,
    runtimeCoverage: { coveredEntries: 1, totalEntries: 1, ratio: 1 },
    dateCoverage: { coveredEntries: 1, totalEntries: 1, ratio: 1 },
  },
  availableYears: [2026],
  pagination: {
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

const insightsResponse = {
  year: 2026,
  summary: response.summary,
  monthly: Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    movieWatches: 0,
    episodeWatches: 0,
    totalEntries: 0,
    estimatedMinutes: 0,
    runtimeCoverage: { coveredEntries: 0, totalEntries: 0, ratio: 0 },
  })),
  daily: [],
  activeDays: 0,
  busiestDay: null,
  dateCoverage: { coveredEntries: 1, totalEntries: 1, ratio: 1 },
  availableYears: [2026],
};

const renderPage = () =>
  renderWithProviders(
    <MemoryRouter>
      <Diary />
    </MemoryRouter>,
  );

describe('viewing diary page', () => {
  beforeEach(() => {
    mocks.useDiaryInsights.mockReturnValue({
      data: insightsResponse,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it('renders the private timeline and its full-filter summary', () => {
    mocks.useDiary.mockReturnValue({
      data: response,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByRole('heading', { name: 'Diary' })).toBeInTheDocument();
    expect(screen.getByText('A Test Film')).toBeInTheDocument();
    expect(screen.getByText('Still excellent.')).toBeInTheDocument();
    expect(screen.getByText('2 hours')).toBeInTheDocument();
    expect(screen.getByText('Current title rating')).toBeInTheDocument();
    expect(screen.getByText('Your diary is private and visible only to you.')).toBeInTheDocument();
  });

  it('resets filters coherently and exposes all three views', async () => {
    mocks.useDiary.mockReturnValue({
      data: response,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderPage();

    fireEvent.change(screen.getByLabelText('Filter diary by year'), { target: { value: '2026' } });
    fireEvent.change(screen.getByLabelText('Filter diary by month'), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('tab', { name: /Calendar/ }));

    expect(screen.getByLabelText('Calendar month')).toBeInTheDocument();
    await waitFor(() =>
      expect(mocks.useDiary).toHaveBeenCalledWith({ page: 1, mediaType: 'all', year: 2026, month: undefined }),
    );

    expect(screen.getByRole('tab', { name: /Insights/ })).toBeInTheDocument();
  });
});
