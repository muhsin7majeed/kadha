import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Liked from '@/pages/liked';
import Watched from '@/pages/watched';
import Watchlist from '@/pages/watchlist';
import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  liked: vi.fn(),
  watched: vi.fn(),
  watchlist: vi.fn(),
}));

vi.mock('@/features/user-media/api/use-liked', () => ({ default: mocks.liked }));
vi.mock('@/features/user-media/api/use-watched', () => ({ default: mocks.watched }));
vi.mock('@/features/user-media/api/use-watch-list', () => ({ default: mocks.watchlist }));

const result = {
  data: {
    data: [],
    access: { canView: true },
    pagination: {
      page: 2,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    facets: { total: 0, genres: [], years: { min: null, max: null } },
  },
  isLoading: false,
  isFetching: false,
  isPlaceholderData: false,
  error: null,
  refetch: vi.fn(),
};

const expectedQuery = {
  page: 2,
  query: 'heat',
  mediaType: 'movie',
  genres: [],
  rating: 'any',
  sort: 'title',
  order: 'asc',
};

const renderPage = (page: React.ReactNode) =>
  renderWithProviders(
    <MemoryRouter initialEntries={['/?page=2&query=heat&mediaType=movie&sort=title&order=asc']}>
      {page}
    </MemoryRouter>,
  );

describe('owner media pages', () => {
  beforeEach(() => {
    mocks.liked.mockReturnValue(result);
    mocks.watched.mockReturnValue(result);
    mocks.watchlist.mockReturnValue(result);
  });

  it.each([
    ['Watchlist', <Watchlist />, mocks.watchlist, 'Recently watchlisted', 'First watchlisted'],
    ['Watched', <Watched />, mocks.watched, 'Recently watched', 'First watched'],
    ['Liked', <Liked />, mocks.liked, 'Recently liked', 'First liked'],
  ])('uses the same URL query contract on %s', (title, page, hook, addedLabel, firstAddedLabel) => {
    renderPage(page);

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByLabelText('Search this library')).toHaveValue('heat');
    expect(screen.getByRole('option', { name: addedLabel })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: firstAddedLabel })).toBeInTheDocument();
    expect(hook).toHaveBeenCalledWith(undefined, { ownerQuery: expectedQuery });
  });
});
