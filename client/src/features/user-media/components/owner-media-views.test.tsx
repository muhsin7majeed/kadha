import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import type { UserMedia } from '@/features/user-media/user-media.types';
import { renderWithProviders } from '@/test/render';
import OwnerMediaListView from './owner-media-list-view';
import OwnerMediaTableView from './owner-media-table-view';

vi.mock('@/atoms/genre-atom', () => ({ useGenreAtom: () => ({ 18: 'Drama', 878: 'Science Fiction' }) }));
vi.mock('@/components/media-card/media-actions', () => ({
  default: () => <div data-testid="media-actions">Actions</div>,
}));

const media: UserMedia = {
  adult: false,
  genre_ids: [18, 878],
  liked: true,
  likedAt: '2026-09-18T12:00:00.000Z',
  media_id: 42,
  media_type: 'movie',
  overview: 'A linguist works to understand visitors whose arrival could change everything.',
  poster_path: '/arrival.jpg',
  rating: 9,
  release_date: '2016-11-11',
  runtime: 116,
  title: 'Arrival',
  vote_average: 7.9,
  vote_count: 19000,
};

const renderView = (view: React.ReactElement) =>
  renderWithProviders(<MemoryRouter>{view}</MemoryRouter>);

describe('owner media list view', () => {
  it('renders the rich owner metadata, poster, saved date, and actions', () => {
    renderView(<OwnerMediaListView data={[media]} libraryKey="liked" showPersonalRating />);

    expect(screen.getByRole('img', { name: 'Arrival poster' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Arrival (2016)' })).toHaveAttribute('href', '/app/media/movie/42');
    expect(screen.getByText(media.overview as string)).toBeInTheDocument();
    expect(screen.getByText('Movie')).toBeInTheDocument();
    expect(screen.getByText('Drama')).toBeInTheDocument();
    expect(screen.getByText('Science Fiction')).toBeInTheDocument();
    expect(screen.getByText('1h 56m')).toBeInTheDocument();
    expect(screen.getByText('TMDB 7.9')).toBeInTheDocument();
    expect(screen.getByText('Your rating 4.5/5')).toBeInTheDocument();
    expect(screen.getByText('Liked 18 Sep 2026')).toBeInTheDocument();
    expect(screen.getByTestId('media-actions')).toBeInTheDocument();
  });

  it('omits personal ratings from Watchlist and shows honest missing metadata', () => {
    renderView(
      <OwnerMediaListView
        data={[{ ...media, genre_ids: [], overview: null, rating: null, runtime: null, watchlistAt: null }]}
        libraryKey="watchlist"
        showPersonalRating={false}
      />,
    );

    expect(screen.queryByText(/Your rating/)).not.toBeInTheDocument();
    expect(screen.getByText('No overview available.')).toBeInTheDocument();
    expect(screen.getByText('Watchlisted —')).toBeInTheDocument();
  });
});

describe('owner media table view', () => {
  it('renders static dense columns without posters or an overview', () => {
    renderView(<OwnerMediaTableView data={[media]} libraryKey="liked" showPersonalRating />);

    const table = screen.getByRole('table', { name: 'Liked library table' });
    expect(table).toHaveStyle({ minWidth: '56rem' });
    expect(screen.getByTestId('owner-library-table-scroll')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Title' })).toHaveStyle({ position: 'sticky', left: '0px' });
    expect(screen.queryByRole('button', { name: 'Title' })).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.queryByText(media.overview as string)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Arrival' })).toBeInTheDocument();
    expect(screen.getByText('4.5/5')).toBeInTheDocument();
    expect(screen.getByText('18 Sep 2026')).toBeInTheDocument();
  });

  it('omits the rating column from Watchlist', () => {
    renderView(<OwnerMediaTableView data={[{ ...media, watchlistAt: '2026-09-17T12:00:00.000Z' }]} libraryKey="watchlist" showPersonalRating={false} />);

    expect(screen.queryByRole('columnheader', { name: 'Your rating' })).not.toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Watchlisted' })).toBeInTheDocument();
  });
});
