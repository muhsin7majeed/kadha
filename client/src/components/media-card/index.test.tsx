import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import type { MediaCardModel } from '@/features/media/media-card-model';
import { renderWithProviders } from '@/test/render';
import MediaCard from '.';

vi.mock('@/features/media-card-preferences/api/use-media-card-preferences', () => ({
  default: () => ({ data: { version: 1, style: 'detailed' } }),
}));

const movie: MediaCardModel = {
  adult: false, genre_ids: [], media_id: 1, media_type: 'movie', poster_path: null,
  release_date: '2024-01-01', runtime: 132, title: 'Test Movie', vote_average: 7.8, vote_count: 123, rating: 9,
};

const renderCard = (card: React.ReactElement) => renderWithProviders(<MemoryRouter>{card}</MemoryRouter>);

describe('media card metadata', () => {
  it('keeps owner-library rating in quick info', async () => {
    const user = userEvent.setup();
    renderCard(<MediaCard media={movie} showActions={false} showLibraryMetadata showPersonalRating />);
    expect(screen.getByRole('group', { name: 'Test Movie facts' })).toHaveTextContent('Movie7.82h 12m2024');
    await user.click(screen.getByRole('button', { name: 'Quick info about Test Movie' }));
    expect(await screen.findByText('Your rating 4.5/5')).toBeInTheDocument();
  });

  it('labels TV runtime per episode and omits a hidden personal rating', async () => {
    const user = userEvent.setup();
    renderCard(<MediaCard media={{ ...movie, media_id: 2, media_type: 'tv', runtime: 45, title: 'Test Show' }} showActions={false} showLibraryMetadata />);
    expect(screen.getByRole('group', { name: 'Test Show facts' })).toHaveTextContent('45m/episode');
    await user.click(screen.getByRole('button', { name: 'Quick info about Test Show' }));
    expect(screen.queryByText('Your rating 4.5/5')).not.toBeInTheDocument();
  });

  it('does not expose a personal rating on shared cards', async () => {
    const user = userEvent.setup();
    renderCard(<MediaCard media={movie} showActions={false} />);
    expect(screen.getByRole('group', { name: 'Test Movie facts' })).toHaveTextContent('7.8');
    await user.click(screen.getByRole('button', { name: 'Quick info about Test Movie' }));
    expect(screen.queryByText('Your rating 4.5/5')).not.toBeInTheDocument();
  });

  it('presents the full poster as a detail navigation target', () => {
    renderCard(<MediaCard media={movie} showActions={false} />);
    expect(screen.getByRole('article')).toHaveStyle({ cursor: 'pointer' });
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});
