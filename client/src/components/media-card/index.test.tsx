import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import type { MediaCardModel } from '@/features/media/media-card-model';
import { renderWithProviders } from '@/test/render';
import MediaCard from '.';

const movie: MediaCardModel = {
  adult: false,
  genre_ids: [],
  media_id: 1,
  media_type: 'movie',
  poster_path: null,
  release_date: '2024-01-01',
  runtime: 132,
  title: 'Test Movie',
  vote_average: 7.8,
  vote_count: 123,
  rating: 9,
};

const renderCard = (card: React.ReactElement) => renderWithProviders(<MemoryRouter>{card}</MemoryRouter>);

describe('media card metadata', () => {
  it('shows owner-library metadata below the media-type pill', () => {
    renderCard(<MediaCard media={movie} showActions={false} showLibraryMetadata showPersonalRating />);

    const mediaType = screen.getByText('Movie');
    const tmdbScore = screen.getByText('TMDB 7.8');

    expect(mediaType.compareDocumentPosition(tmdbScore) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('2h 12m')).toBeInTheDocument();
    expect(screen.getByText('Your rating 4.5/5')).toBeInTheDocument();
    expect(screen.queryByText(/from 123 votes/)).not.toBeInTheDocument();
  });

  it('labels TV runtime per episode and omits a hidden personal rating', () => {
    renderCard(
      <MediaCard
        media={{ ...movie, media_id: 2, media_type: 'tv', runtime: 45, title: 'Test Show' }}
        showActions={false}
        showLibraryMetadata
      />,
    );

    expect(screen.getByText('45m/episode')).toBeInTheDocument();
    expect(screen.queryByText('Your rating 4.5/5')).not.toBeInTheDocument();
  });

  it('keeps the existing compact score presentation on shared cards', () => {
    renderCard(<MediaCard media={movie} showActions={false} />);

    expect(screen.getByText('7.8')).toBeInTheDocument();
    expect(screen.getByText(/from 123 votes/)).toBeInTheDocument();
    expect(screen.getByText('2h 12m')).toBeInTheDocument();
    expect(screen.queryByText('TMDB 7.8')).not.toBeInTheDocument();
    expect(screen.queryByText('Your rating 4.5/5')).not.toBeInTheDocument();
  });
});
