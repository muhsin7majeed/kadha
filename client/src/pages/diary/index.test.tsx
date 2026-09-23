import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderWithProviders(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Diary />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

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
    expect(
      getComputedStyle(screen.getByRole('radiogroup', { name: 'Filter diary by media type' })).getPropertyValue(
        '--chakra-colors-color-palette-solid',
      ),
    ).toBe('var(--chakra-colors-brand-solid)');
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

  it('resets selected-day pagination when the media type changes', async () => {
    mocks.useDiaryInsights.mockReturnValue({
      data: {
        ...insightsResponse,
        daily: [
          {
            date: '2026-09-13',
            movieWatches: 1,
            episodeWatches: 0,
            totalEntries: 1,
            estimatedMinutes: 120,
            runtimeCoverage: { coveredEntries: 1, totalEntries: 1, ratio: 1 },
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    });
    mocks.useDiary.mockImplementation((query: { page: number; date?: string }) => ({
      data: query.date
        ? {
            ...response,
            pagination: {
              page: query.page,
              limit: 20,
              total: 21,
              totalPages: 2,
              hasNextPage: query.page === 1,
              hasPreviousPage: query.page === 2,
            },
          }
        : response,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    }));

    renderPage();

    const calendarTab = screen.getByRole('tab', { name: /Calendar/ });
    fireEvent.click(calendarTab);
    await waitFor(() => expect(calendarTab).toHaveAttribute('aria-selected', 'true'));
    fireEvent.change(screen.getByLabelText('Calendar month'), { target: { value: '9' } });
    fireEvent.click(
      await screen.findByRole('button', {
        name: /September 13, 2026, 1 watch, 1 movie, 0 episodes/,
      }),
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Next page' }));

    await waitFor(() =>
      expect(mocks.useDiary).toHaveBeenCalledWith(
        { page: 2, mediaType: 'all', date: '2026-09-13' },
        true,
      ),
    );

    fireEvent.click(screen.getByText('TV'));

    await waitFor(() =>
      expect(mocks.useDiary).toHaveBeenCalledWith(
        { page: 1, mediaType: 'tv', date: '2026-09-13' },
        true,
      ),
    );
  });
});
