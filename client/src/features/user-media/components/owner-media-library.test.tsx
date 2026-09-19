import { fireEvent, screen, waitFor } from '@testing-library/react';
import { LuHeart } from 'react-icons/lu';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultOwnerMediaQuery } from '@/features/user-media/api/use-owner-media-query';
import { renderWithProviders } from '@/test/render';
import OwnerMediaLibrary from './owner-media-library';

const responsive = vi.hoisted(() => ({ desktop: false }));

vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@chakra-ui/react')>();
  return { ...actual, useBreakpointValue: () => responsive.desktop };
});

const response = {
  data: [],
  access: { canView: true },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  facets: {
    total: 0,
    genres: [
      { id: 12, name: 'Adventure' },
      { id: 18, name: 'Drama' },
    ],
    years: { min: 1970, max: 2026 },
  },
};

const baseProps = {
  addedLabel: 'Recently liked',
  firstAddedLabel: 'First liked',
  description: 'Your favorites.',
  emptyState: { title: 'No favorites yet', description: 'Like something first.', icon: <LuHeart /> },
  error: null,
  errorDescription: 'Failed to fetch liked',
  isFetching: false,
  isLoading: false,
  isPlaceholderData: false,
  loadingText: 'Loading favorites...',
  query: defaultOwnerMediaQuery,
  refetch: vi.fn(),
  response,
  title: 'Liked',
};

describe('owner media library', () => {
  beforeEach(() => {
    responsive.desktop = false;
  });

  it('debounces title search and commits type and sort controls', async () => {
    const updateQuery = vi.fn();
    renderWithProviders(<OwnerMediaLibrary {...baseProps} updateQuery={updateQuery} />);

    fireEvent.change(screen.getByLabelText('Search this library'), { target: { value: 'arrival' } });
    await waitFor(() => expect(updateQuery).toHaveBeenCalledWith({ query: 'arrival' }, { replace: true }));

    fireEvent.click(screen.getByRole('button', { name: 'Movies' }));
    expect(updateQuery).toHaveBeenCalledWith({ mediaType: 'movie' });

    fireEvent.change(screen.getByLabelText('Sort library'), { target: { value: 'title:asc' } });
    expect(updateQuery).toHaveBeenCalledWith({ sort: 'title', order: 'asc' });
    expect(screen.getByRole('option', { name: 'Recently liked' })).toBeInTheDocument();
  });

  it('batches match-all genres, years, and rating behind Apply', async () => {
    const updateQuery = vi.fn();
    renderWithProviders(<OwnerMediaLibrary {...baseProps} updateQuery={updateQuery} />);

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    fireEvent.click(await screen.findByRole('checkbox', { name: 'Drama' }));
    fireEvent.change(screen.getByLabelText('From year'), { target: { value: '2000' } });
    fireEvent.change(screen.getByLabelText('Through year'), { target: { value: '2020' } });
    fireEvent.change(screen.getByLabelText('Personal rating'), { target: { value: '8' } });

    expect(updateQuery).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));

    expect(updateQuery).toHaveBeenCalledWith({ genres: [18], yearFrom: 2000, yearTo: 2020, rating: 8 });
  });

  it('keeps controls visible for filtered-empty results and clears all criteria in one action', () => {
    const updateQuery = vi.fn();
    renderWithProviders(
      <OwnerMediaLibrary
        {...baseProps}
        query={{ ...defaultOwnerMediaQuery, query: 'not here', genres: [18] }}
        response={{ ...response, facets: { ...response.facets, total: 12 } }}
        updateQuery={updateQuery}
      />,
    );

    expect(screen.getByRole('heading', { name: 'No titles match these filters' })).toBeInTheDocument();
    expect(screen.getByLabelText('Search this library')).toBeInTheDocument();
    expect(screen.getByText('0 titles match your filters')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(updateQuery).toHaveBeenCalledWith(defaultOwnerMediaQuery);
  });

  it('qualifies placeholder results and locks conflicting controls', () => {
    renderWithProviders(
      <OwnerMediaLibrary
        {...baseProps}
        isFetching
        isPlaceholderData
        query={{ ...defaultOwnerMediaQuery, genres: [18] }}
        response={{
          ...response,
          pagination: { ...response.pagination, total: 100, totalPages: 5 },
          facets: { ...response.facets, total: 100 },
        }}
        updateQuery={vi.fn()}
      />,
    );

    expect(screen.getByText(/Updating results/)).toBeInTheDocument();
    expect(screen.queryByText(/titles below/)).not.toBeInTheDocument();
    expect(screen.queryByText('100 titles match your filters')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Search this library')).toBeDisabled();
    expect(screen.getByRole('button', { name: /Clear all/ })).toBeDisabled();
  });

  it('repairs an out-of-range restored page without showing a false empty state', async () => {
    const updateQuery = vi.fn();
    renderWithProviders(
      <OwnerMediaLibrary
        {...baseProps}
        query={{ ...defaultOwnerMediaQuery, page: 999 }}
        response={{
          ...response,
          pagination: { ...response.pagination, page: 999, total: 23, totalPages: 2 },
          facets: { ...response.facets, total: 23 },
        }}
        updateQuery={updateQuery}
      />,
    );

    await waitFor(() => expect(updateQuery).toHaveBeenCalledWith({ page: 2 }, { replace: true }));
    expect(screen.queryByRole('heading', { name: 'No favorites yet' })).not.toBeInTheDocument();
  });

  it('keeps a truly empty base library distinct even with restored criteria', () => {
    renderWithProviders(
      <OwnerMediaLibrary
        {...baseProps}
        query={{ ...defaultOwnerMediaQuery, query: 'anything' }}
        updateQuery={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'No favorites yet' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'No titles match these filters' })).not.toBeInTheDocument();
  });

  it('shows runtime sorting only for a single media type and contextual ascending copy', () => {
    const { rerender } = renderWithProviders(<OwnerMediaLibrary {...baseProps} updateQuery={vi.fn()} />);

    expect(screen.queryByRole('option', { name: 'Shortest runtime' })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'First liked' })).toBeInTheDocument();

    rerender(
      <OwnerMediaLibrary
        {...baseProps}
        query={{ ...defaultOwnerMediaQuery, mediaType: 'movie' }}
        updateQuery={vi.fn()}
      />,
    );
    expect(screen.getByRole('option', { name: 'Shortest runtime' })).toBeInTheDocument();
  });

  it('blocks invalid year ranges and removes applied chips individually', async () => {
    const updateQuery = vi.fn();
    renderWithProviders(
      <OwnerMediaLibrary
        {...baseProps}
        query={{ ...defaultOwnerMediaQuery, genres: [18] }}
        response={{ ...response, facets: { ...response.facets, total: 10 } }}
        updateQuery={updateQuery}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove Drama filter' }));
    expect(updateQuery).toHaveBeenCalledWith({ genres: [] });

    fireEvent.click(screen.getByRole('button', { name: /Filters/ }));
    const fromYearInput = await screen.findByLabelText('From year');
    fireEvent.change(fromYearInput, { target: { value: '1960' } });
    const yearError = screen.getByText(/Use whole years from 1970 through 2026/);

    expect(fromYearInput).toHaveAttribute('aria-describedby', yearError.id);
    expect(screen.getByLabelText('Through year')).toHaveAttribute('aria-describedby', yearError.id);
    expect(screen.getByRole('button', { name: 'Apply filters' })).toBeDisabled();
  });

  it('uses a full mobile dialog and restores focus when it closes', async () => {
    renderWithProviders(<OwnerMediaLibrary {...baseProps} updateQuery={vi.fn()} />);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('data-scope', 'dialog');
    const yearInput = screen.getByLabelText('From year');
    yearInput.focus();
    expect(yearInput).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Escape' });

    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('uses an anchored popover at desktop breakpoints', async () => {
    responsive.desktop = true;
    renderWithProviders(<OwnerMediaLibrary {...baseProps} updateQuery={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));

    expect(await screen.findByRole('dialog')).toHaveAttribute('data-filter-presentation', 'desktop');
  });
});
