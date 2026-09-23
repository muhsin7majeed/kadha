import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import type { MediaCardModel } from '@/features/media/media-card-model';
import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  addLiked: vi.fn(),
  addWatched: vi.fn(),
  addWatchlist: vi.fn(),
}));

vi.mock('@/features/user-media/api/use-add-to-liked', () => ({
  default: () => ({ mutateAsync: mocks.addLiked, isPending: false }),
}));
vi.mock('@/features/user-media/api/use-add-to-watched', () => ({
  default: () => ({ mutateAsync: mocks.addWatched, isPending: false }),
}));
vi.mock('@/features/user-media/api/use-add-to-watch-list', () => ({
  default: () => ({ mutateAsync: mocks.addWatchlist, isPending: false }),
}));
vi.mock('@/features/collections/components/add-to-collection-dialog', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div role="dialog">Add to collection</div> : null),
}));
vi.mock('@/features/user-media/components/media-tracking-details-dialog', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div role="dialog">Your tracking</div> : null),
}));
vi.mock('@/features/user-media/components/media-tracking-dialog', () => ({ default: () => null }));
vi.mock('@/features/user-media/components/movie-watch-history-dialog', () => ({ default: () => null }));
vi.mock('@/features/user-media/components/watch-event-dialog', () => ({ default: () => null }));
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
}));

import MediaActions from './media-actions';

const media: MediaCardModel = {
  adult: false,
  genre_ids: [],
  media_id: 1,
  media_type: 'tv',
  poster_path: null,
  release_date: '2020-01-01',
  title: 'Example Show',
  vote_average: 8,
  vote_count: 100,
  liked: false,
  watched: true,
  watchlist: false,
};

describe('MediaActions menu presentation', () => {
  it('presents the existing media actions in a labelled overflow menu', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MediaActions media={media} presentation="menu" />);

    await user.click(screen.getByRole('button', { name: 'Manage Example Show' }));

    expect(screen.getByRole('menuitem', { name: 'Like' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Manage personal tracking' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Manage watched tracking' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Add to watchlist' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Add to collection' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Edit card view' })).not.toBeInTheDocument();
  });

  it('links to Appearance only when used on a shared poster card', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MemoryRouter initialEntries={['/app/media/tv/1']}>
        <MediaActions media={media} presentation="menu" showCardStyleLink />
        <Routes>
          <Route path="/app/media/tv/1" element={null} />
          <Route path="/app/settings/appearance" element={<div>Appearance destination</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Manage Example Show' }));
    const link = screen.getByRole('menuitem', { name: 'Edit card view' });
    expect(link).toHaveAttribute('href', '/app/settings/appearance');
    await user.click(link);
    expect(screen.getByText('Appearance destination')).toBeInTheDocument();
  });

  it('keeps dynamic labels and dispatches the selected action', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MediaActions media={{ ...media, liked: true, watchlist: true }} presentation="menu" />,
    );

    await user.click(screen.getByRole('button', { name: 'Manage Example Show' }));

    expect(screen.getByRole('menuitem', { name: 'Unlike' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Remove from watchlist' })).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: 'Unlike' }));

    expect(mocks.addLiked).toHaveBeenCalledTimes(1);
  });
});
