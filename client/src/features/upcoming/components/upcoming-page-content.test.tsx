import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type { UpcomingResponse } from '@/features/upcoming/upcoming.types';
import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  data: undefined as UpcomingResponse | undefined,
  error: null as Error | null,
  isFetching: false,
  isLoading: false,
  refetch: vi.fn(),
  useUpcoming: vi.fn(),
}));

vi.mock('@/features/upcoming/api/use-upcoming', () => ({
  default: (range: { from: string; to: string }) => {
    mocks.useUpcoming(range);
    return {
      data: mocks.data,
      error: mocks.error,
      isError: Boolean(mocks.error),
      isFetching: mocks.isFetching,
      isLoading: mocks.isLoading,
      refetch: mocks.refetch,
    };
  },
}));

import UpcomingPageContent from './upcoming-page-content';

const testNow = new Date('2026-09-20T12:00:00.000Z');

const response: UpcomingResponse = {
  coverage: { trackedTitles: 2, resolvedTitles: 2, failedTitles: 0 },
  entries: [
    {
      kind: 'episode-release',
      date: '2026-09-25',
      media: {
        adult: false,
        backdrop_path: null,
        genre_ids: [18],
        media_id: 101,
        media_type: 'tv',
        original_language: 'en',
        original_title: 'Group Drop',
        overview: 'Two episodes arrive together.',
        popularity: 1,
        poster_path: '/group-drop.jpg',
        release_date: '2020-01-01',
        title: 'Group Drop',
        vote_average: 8,
        vote_count: 20,
      },
      episodes: [
        { seasonNumber: 2, episodeNumber: 1, episodeId: 201, name: 'Return' },
        { seasonNumber: 2, episodeNumber: 2, episodeId: 202, name: 'Again' },
      ],
    },
    {
      kind: 'movie-release',
      date: '2026-09-25',
      media: {
        adult: false,
        backdrop_path: null,
        genre_ids: [12],
        media_id: 301,
        media_type: 'movie',
        original_language: 'en',
        original_title: 'Future Film',
        overview: 'A future movie.',
        popularity: 1,
        poster_path: null,
        release_date: '2026-09-25',
        title: 'Future Film',
        vote_average: 7,
        vote_count: 10,
      },
    },
  ],
};

const renderContent = () =>
  renderWithProviders(
    <MemoryRouter>
      <UpcomingPageContent />
    </MemoryRouter>,
  );

describe('UpcomingPageContent', () => {
  beforeAll(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.setSystemTime(testNow);
    mocks.data = structuredClone(response);
    mocks.error = null;
    mocks.isFetching = false;
    mocks.isLoading = false;
    mocks.refetch.mockReset();
    mocks.useUpcoming.mockReset();
  });

  it('defaults to a chronological list with grouped episodes, date context, and media links', () => {
    renderContent();

    expect(screen.getByRole('tab', { name: 'List' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Friday, September 25, 2026' })).toBeInTheDocument();
    expect(screen.getByText('In 5 days')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Group Drop' })).toHaveAttribute('href', '/app/media/tv/101');
    expect(screen.getByText('S2 E1 · Return')).toBeInTheDocument();
    expect(screen.getByText('S2 E2 · Again')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Future Film' })).toHaveAttribute('href', '/app/media/movie/301');
    expect(screen.getAllByRole('link', { name: 'Group Drop' })).toHaveLength(1);
    const showPoster = screen.getByRole('img', { name: 'Group Drop poster' });
    expect(showPoster).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w185/group-drop.jpg');
    expect(screen.getByRole('img', { name: 'Future Film poster' })).toHaveAttribute(
      'src',
      '/assets/images/image-placeholder.svg',
    );

    fireEvent.error(showPoster);
    expect(showPoster).toHaveAttribute('src', '/assets/images/image-placeholder.svg');
  });

  it('keeps successful entries visible while disclosing partial provider coverage', () => {
    mocks.data = {
      ...structuredClone(response),
      coverage: { trackedTitles: 3, resolvedTitles: 2, failedTitles: 1 },
    };

    renderContent();

    expect(screen.getByRole('status')).toHaveTextContent('Some upcoming dates could not be refreshed');
    expect(screen.getByRole('link', { name: 'Group Drop' })).toBeInTheDocument();
  });

  it('discloses partial provider coverage even when the resolved titles have no entries', () => {
    mocks.data = {
      entries: [],
      coverage: { trackedTitles: 2, resolvedTitles: 1, failedTitles: 1 },
    };

    renderContent();

    expect(screen.getByRole('status')).toHaveTextContent('Some upcoming dates could not be refreshed');
    expect(screen.getByText('Nothing scheduled')).toBeInTheDocument();
  });

  it('uses the UTC calendar date for the query boundary', () => {
    const originalTimeZone = process.env.TZ;
    process.env.TZ = 'America/Los_Angeles';
    vi.setSystemTime(new Date('2026-09-21T00:30:00.000Z'));

    try {
      renderContent();
      expect(mocks.useUpcoming).toHaveBeenCalledWith({ from: '2026-09-21', to: '2026-12-21' });
    } finally {
      if (originalTimeZone === undefined) {
        delete process.env.TZ;
      } else {
        process.env.TZ = originalTimeZone;
      }
    }
  });

  it('switches to the month grid, selects a populated date, and requests new months', async () => {
    renderContent();

    fireEvent.click(screen.getByRole('tab', { name: 'Month' }));
    const monthSelect = await waitFor(() => screen.getByRole('combobox', { name: 'Calendar month' }));
    fireEvent.change(monthSelect, { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: /September 25, 2026, 3 releases/ }));

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Selected day' })).toBeInTheDocument());
    expect(screen.getByText('In 5 days')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Group Drop poster' })).toBeInTheDocument();
    expect(screen.getByText('S2 E1 · Return')).toBeInTheDocument();
    expect(mocks.useUpcoming).toHaveBeenCalledWith({ from: '2026-09-20', to: '2026-09-30' });
  });

  it('renders distinct empty and complete error states', () => {
    mocks.data = { entries: [], coverage: { trackedTitles: 0, resolvedTitles: 0, failedTitles: 0 } };
    const { rerender } = renderContent();

    expect(screen.getByText('Nothing scheduled')).toBeInTheDocument();

    mocks.data = undefined;
    mocks.error = new Error('failed');
    rerender(
      <MemoryRouter>
        <UpcomingPageContent />
      </MemoryRouter>,
    );

    expect(screen.getByText('Upcoming dates unavailable')).toBeInTheDocument();
  });
});
