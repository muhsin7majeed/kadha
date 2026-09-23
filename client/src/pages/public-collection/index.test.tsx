import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import PublicCollection from '.';

const mocks = vi.hoisted(() => ({
  collectionMediaViews: vi.fn(),
  usePublicCollection: vi.fn(),
}));

vi.mock('@/features/collections/api/use-public-collection', () => ({ default: mocks.usePublicCollection }));
vi.mock('@/features/collections/components/collection-media-views', () => ({
  default: (props: unknown) => {
    mocks.collectionMediaViews(props);
    return <div>Collection media views</div>;
  },
}));

const media = [{ media_id: 42, media_type: 'movie', title: 'Arrival' }];

const renderPage = () =>
  renderWithProviders(
    <MemoryRouter initialEntries={['/share/collections/collection-1']}>
      <Routes>
        <Route path="/share/collections/:id" element={<PublicCollection />} />
      </Routes>
    </MemoryRouter>,
  );

describe('PublicCollection', () => {
  it('uses the shared read-only collection views with public media links', () => {
    mocks.usePublicCollection.mockReturnValue({
      data: {
        access: { canView: true },
        data: {
          id: 'collection-1',
          name: 'Weekend picks',
          description: 'A short list.',
          owner: { username: 'owner' },
          media,
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByRole('heading', { name: 'Weekend picks' })).toBeInTheDocument();
    expect(screen.getByText('Collection media views')).toBeInTheDocument();
    expect(mocks.collectionMediaViews).toHaveBeenCalledWith(expect.objectContaining({
      media,
      detailsPathPrefix: '/media',
      showActions: false,
    }));
  });
});
