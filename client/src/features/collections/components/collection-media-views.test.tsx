import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CollectionMedia } from '@/features/collections/collections.types';
import { collectionMediaViewStorageKey } from '@/features/collections/hooks/use-collection-media-view';
import { renderWithProviders } from '@/test/render';
import CollectionMediaViews from './collection-media-views';

vi.mock('@/atoms/genre-atom', () => ({ useGenreAtom: () => ({ 18: 'Drama' }) }));
vi.mock('@/components/media-card', () => ({
  default: ({ media }: { media: { title: string } }) => <article>{media.title}</article>,
}));
vi.mock('@/components/media-card/media-actions', () => ({
  default: () => <div data-testid="media-actions">Actions</div>,
}));

const media: CollectionMedia[] = [
  {
    adult: false,
    collectionId: 'collection-1',
    created_at: new Date('2026-01-01'),
    genre_ids: [18],
    liked: false,
    media_id: 42,
    media_type: 'movie',
    overview: 'A linguist tries to understand unexpected visitors.',
    poster_path: '/arrival.jpg',
    release_date: '2016-11-11',
    title: 'Arrival',
    vote_average: 7.9,
    vote_count: 19000,
    watched: false,
    watchlist: false,
  },
];

const renderViews = (showActions = false) =>
  renderWithProviders(
    <MemoryRouter>
      <CollectionMediaViews
        media={media}
        detailsPathPrefix="/media"
        showActions={showActions}
      />
    </MemoryRouter>,
  );

describe('CollectionMediaViews', () => {
  beforeEach(() => window.localStorage.clear());

  it('switches between all views, persists the choice, and keeps public views read-only', async () => {
    const user = userEvent.setup();
    const firstRender = renderViews();

    expect(screen.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'List view' }));
    expect(screen.getByRole('link', { name: 'Arrival (2016)' })).toHaveAttribute('href', '/media/movie/42');
    expect(screen.queryByTestId('media-actions')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Table view' }));
    expect(screen.getByRole('table', { name: 'Collection media table' })).toBeInTheDocument();
    expect(window.localStorage.getItem(collectionMediaViewStorageKey)).toBe('table');

    firstRender.unmount();
    renderViews();

    expect(screen.getByRole('button', { name: 'Table view' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('table', { name: 'Collection media table' })).toBeInTheDocument();
  });

  it('retains personal media actions for authenticated collection views', async () => {
    const user = userEvent.setup();
    renderViews(true);

    await user.click(screen.getByRole('button', { name: 'List view' }));

    expect(screen.getByTestId('media-actions')).toBeInTheDocument();
  });
});
