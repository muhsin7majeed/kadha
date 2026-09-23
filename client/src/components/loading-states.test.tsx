import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import ListSkeleton from '@/components/loading/list-skeleton';
import MediaListSkeleton from '@/components/loading/media-list-skeleton';
import MediaCarousel from '@/components/media-carousel';
import PageHeader from '@/components/page-header';
import { renderWithProviders } from '@/test/render';

describe('shared loading states', () => {
  it('keeps refresh status separate from the page heading', () => {
    const rendered = renderWithProviders(<PageHeader isRefreshing>Library</PageHeader>);

    expect(screen.getByRole('heading', { name: 'Library' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing content');

    rendered.rerender(<PageHeader isRefreshing={false}>Library</PageHeader>);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('labels structural skeleton regions', () => {
    const rendered = renderWithProviders(<MediaListSkeleton label="Loading your watchlist" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading your watchlist');

    rendered.rerender(<ListSkeleton label="Loading activity" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading activity');
  });

  it('uses a labelled carousel skeleton only for initial loading', () => {
    const rendered = renderWithProviders(
      <MemoryRouter>
        <MediaCarousel title="Trending" data={[]} isLoading isFetching />
      </MemoryRouter>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading Trending');
    expect(screen.queryByText('Refreshing content')).not.toBeInTheDocument();

    rendered.rerender(
      <MemoryRouter>
        <MediaCarousel title="Trending" data={[]} isFetching />
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing content');
  });
});
