import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router';
import { useRef } from 'react';
import { describe, expect, it } from 'vitest';

import useOwnerMediaQuery, {
  defaultOwnerMediaQuery,
  normalizeOwnerMediaQuery,
  parseOwnerMediaSearchParams,
  serializeOwnerMediaQuery,
  updateOwnerMediaQuery,
} from './use-owner-media-query';

const QueryHarness = ({ supportsPersonalRating = true }: { supportsPersonalRating?: boolean }) => {
  const { query, updateQuery } = useOwnerMediaQuery(supportsPersonalRating);
  const location = useLocation();
  const navigate = useNavigate();
  const retainedUpdate = useRef(updateQuery);

  return (
    <>
      <output data-testid="search">{location.search}</output>
      <output data-testid="query">{JSON.stringify(query)}</output>
      <button onClick={() => updateQuery({ query: 'heat' }, { replace: true })}>Replace query</button>
      <button onClick={() => updateQuery({ sort: 'title' })}>Sort by title</button>
      <button onClick={() => retainedUpdate.current({ query: 'heat' }, { replace: true })}>Retained query</button>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
    </>
  );
};

const PreviousPage = () => {
  const navigate = useNavigate();
  return <button onClick={() => navigate(1)}>Forward to library</button>;
};

const renderHarness = (
  initialEntries: string[],
  initialIndex = initialEntries.length - 1,
  supportsPersonalRating = true,
) =>
  render(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <Routes>
        <Route path="/previous" element={<PreviousPage />} />
        <Route path="/library" element={<QueryHarness supportsPersonalRating={supportsPersonalRating} />} />
      </Routes>
    </MemoryRouter>,
  );

describe('owner media URL query', () => {
  it('parses valid URL state and normalizes genre IDs', () => {
    const query = parseOwnerMediaSearchParams(
      new URLSearchParams(
        'page=3&query=alien&mediaType=movie&genres=18,12,18&yearFrom=1979&yearTo=2024&rating=8&sort=title&order=asc',
      ),
    );

    expect(query).toEqual({
      page: 3,
      query: 'alien',
      mediaType: 'movie',
      genres: [12, 18],
      yearFrom: 1979,
      yearTo: 2024,
      rating: 8,
      sort: 'title',
      order: 'asc',
    });
  });

  it('drops invalid values and incompatible runtime sorting', () => {
    const query = parseOwnerMediaSearchParams(
      new URLSearchParams(
        `page=0&query=${'x'.repeat(121)}&mediaType=book&genres=12,nope&yearFrom=2025&yearTo=2020&rating=11&sort=runtime&order=sideways`,
      ),
    );

    expect(query).toEqual(defaultOwnerMediaQuery);
    expect(parseOwnerMediaSearchParams(new URLSearchParams(`genres=${'1,'.repeat(251)}1`)).genres).toEqual([]);
  });

  it('removes unsupported personal-rating state from watchlist queries', () => {
    const ratingFilter = parseOwnerMediaSearchParams(new URLSearchParams('page=3&rating=8&sort=title&order=asc'));
    const ratingSort = parseOwnerMediaSearchParams(new URLSearchParams('page=3&sort=rating&order=asc'));

    expect(normalizeOwnerMediaQuery(ratingFilter, false)).toMatchObject({
      page: 3,
      rating: 'any',
      sort: 'title',
      order: 'asc',
    });
    expect(normalizeOwnerMediaQuery(ratingSort, false)).toEqual({ ...defaultOwnerMediaQuery, page: 3 });
    expect(normalizeOwnerMediaQuery(ratingFilter, true)).toEqual(ratingFilter);
  });

  it.each([
    ['/library?page=3&rating=8', '?page=3'],
    ['/library?page=3&sort=rating&order=asc', '?page=3'],
  ])('canonicalizes unsupported watchlist rating URLs: %s', async (initialEntry, expectedSearch) => {
    renderHarness([initialEntry], 0, false);

    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent(expectedSearch));
  });

  it('serializes stable non-default URL state', () => {
    const params = serializeOwnerMediaQuery({
      page: 2,
      query: '  arrival  ',
      mediaType: 'tv',
      genres: [35, 12, 35],
      yearFrom: 1990,
      yearTo: 2020,
      rating: 'unrated',
      sort: 'releaseDate',
      order: 'asc',
    });

    expect(params.toString()).toBe(
      'page=2&query=arrival&mediaType=tv&genres=12%2C35&yearFrom=1990&yearTo=2020&rating=unrated&sort=releaseDate&order=asc',
    );
    expect(serializeOwnerMediaQuery(defaultOwnerMediaQuery).toString()).toBe('');
  });

  it('resets pagination after criteria changes and repairs runtime sorting when type becomes mixed', () => {
    const current = { ...defaultOwnerMediaQuery, page: 4, mediaType: 'movie' as const, sort: 'runtime' as const };

    expect(updateOwnerMediaQuery(current, { query: 'heat' })).toMatchObject({ page: 1, query: 'heat' });
    expect(updateOwnerMediaQuery(current, { page: 3 })).toMatchObject({ page: 3, sort: 'runtime' });
    expect(updateOwnerMediaQuery(current, { mediaType: 'movie' })).toMatchObject({ page: 4, mediaType: 'movie' });
    expect(updateOwnerMediaQuery(current, { mediaType: 'all' })).toMatchObject({
      page: 1,
      mediaType: 'all',
      sort: 'added',
      order: 'desc',
    });
  });

  it('replaces invalid initial and forward history entries with canonical URL state', async () => {
    renderHarness(['/previous', '/library?sort=runtime&order=asc&genres=18,12,18&unknown=value']);

    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?genres=12%2C18'));

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Forward to library' }));

    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?genres=12%2C18'));
  });

  it('uses replace semantics for debounced query updates', async () => {
    renderHarness(['/previous', '/library?page=2']);

    fireEvent.click(screen.getByRole('button', { name: 'Replace query' }));
    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('?query=heat'));

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(await screen.findByRole('button', { name: 'Forward to library' })).toBeInTheDocument();
  });

  it('applies retained delayed updates to the latest URL criteria', async () => {
    renderHarness(['/library?mediaType=movie']);

    fireEvent.click(screen.getByRole('button', { name: 'Sort by title' }));
    await waitFor(() => expect(screen.getByTestId('search')).toHaveTextContent('sort=title'));
    fireEvent.click(screen.getByRole('button', { name: 'Retained query' }));

    await waitFor(() =>
      expect(screen.getByTestId('search')).toHaveTextContent('?query=heat&mediaType=movie&sort=title'),
    );
  });
});
