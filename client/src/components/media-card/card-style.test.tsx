import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MediaCardModel } from '@/features/media/media-card-model';
import { renderWithProviders } from '@/test/render';
import MediaCard from '.';

const mock = vi.hoisted(() => ({ style: 'detailed' as 'detailed' | 'minimal' }));
vi.mock('@/atoms/genre-atom', () => ({ useGenreAtom: () => ({ 18: 'Drama' }) }));
vi.mock('@/features/media-card-preferences/api/use-media-card-preferences', () => ({
  default: () => ({ data: { version: 1, style: mock.style } }),
}));

const media: MediaCardModel = {
  adult: false, genre_ids: [18], media_id: 1, media_type: 'movie', poster_path: null,
  release_date: '2024-01-01', runtime: 123, title: 'Long Movie Name', overview: 'A short synopsis',
  vote_average: 7.5, vote_count: 30, liked: true, watched: true, watchlist: false,
};
const renderCard = (item = media, showActions = false) => renderWithProviders(
  <MemoryRouter><MediaCard media={item} showActions={showActions} /></MemoryRouter>,
);

describe('shared media card style', () => {
  beforeEach(() => { mock.style = 'detailed'; });

  it('shows ordered facts and active-only passive states on the detailed overlay', () => {
    renderCard();
    const facts = screen.getByRole('group', { name: 'Long Movie Name facts' });
    expect(facts.textContent).toMatch(/Movie.*7\.5.*2h 3m.*2024/);
    expect(screen.getByLabelText('Liked Long Movie Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Watched Long Movie Name')).toBeInTheDocument();
    expect(screen.queryByLabelText('Watchlisted Long Movie Name')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Long Movie Name title' })).toHaveStyle({ overflowX: 'auto' });
    expect(screen.getByRole('group', { name: 'Long Movie Name genres' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('link', { name: 'Long Movie Name' })).toHaveAttribute('href', '/app/media/movie/1');
  });

  it('keeps the detailed title an actual navigation link', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    renderWithProviders(<MemoryRouter><MediaCard media={media} showActions={false} onNavigate={onNavigate} /></MemoryRouter>);
    await user.click(screen.getByRole('link', { name: 'Long Movie Name' }));
    expect(onNavigate).toHaveBeenCalledOnce();
  });

  it('limits minimal to poster, controls and stacked active statuses', async () => {
    mock.style = 'minimal';
    const user = userEvent.setup();
    renderCard();
    expect(screen.getByRole('group', { name: 'Long Movie Name statuses' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Long Movie Name facts' })).not.toBeInTheDocument();
    expect(screen.queryByText('Long Movie Name', { selector: 'h3' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Quick info about Long Movie Name' }));
    expect(await screen.findByText('A short synopsis')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Long Movie Name' })).toHaveAttribute('href', '/app/media/movie/1');
  });

  it('omits personal state and menu on public read-only cards', () => {
    mock.style = 'minimal';
    renderCard({ ...media, liked: false, watched: false, watchlist: false });
    expect(screen.queryByRole('group', { name: 'Long Movie Name statuses' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Manage Long Movie Name' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quick info about Long Movie Name' })).toBeInTheDocument();
  });
});
