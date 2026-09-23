import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { MediaCardModel } from '@/features/media/media-card-model';
import { renderWithProviders } from '@/test/render';
import MediaCardGrid from './media-card-grid';

vi.mock('@/components/media-card', () => ({
  default: ({ media }: { media: MediaCardModel }) => <article>{media.title}</article>,
}));

const media: MediaCardModel[] = [
  {
    adult: false,
    genre_ids: [],
    media_id: 1,
    media_type: 'movie',
    poster_path: '/one.jpg',
    release_date: '2020-01-01',
    title: 'One',
    vote_average: 7,
    vote_count: 10,
  },
  {
    adult: false,
    genre_ids: [],
    media_id: 2,
    media_type: 'movie',
    poster_path: '/two.jpg',
    release_date: '2021-01-01',
    title: 'Two',
    vote_average: 8,
    vote_count: 20,
  },
];

describe('MediaCardGrid', () => {
  it('uses the shared auto-fitting mobile grid and renders full-width cards', () => {
    renderWithProviders(<MediaCardGrid media={media} />);

    expect(screen.getByTestId('media-card-grid')).toHaveStyle({
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(10rem, 100%), 1fr))',
    });
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });
});
