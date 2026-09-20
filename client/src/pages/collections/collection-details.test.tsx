import { fireEvent, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { DataPrivacy } from '@/types/common';
import CollectionDetailsPage from './collection-details';

const mocks = vi.hoisted(() => ({
  useCollection: vi.fn(),
  clearUnavailableCollection: vi.fn(),
  isUnavailableCollectionError: vi.fn(() => false),
}));

vi.mock('@/features/collections/api/use-collection', () => ({ default: mocks.useCollection }));
vi.mock('@/features/collections/utils/collection-query-errors', () => ({
  clearUnavailableCollection: mocks.clearUnavailableCollection,
  isUnavailableCollectionError: mocks.isUnavailableCollectionError,
}));
vi.mock('@/features/collections/components/collection-details-content', () => ({
  default: ({ collection }: { collection: { name: string } }) => <div>Contents of {collection.name}</div>,
}));
vi.mock('@/features/collections/components/collection-menu', () => ({
  default: ({ onCollectionUnavailable }: { onCollectionUnavailable?: () => void }) => (
    <button type="button" onClick={onCollectionUnavailable}>
      Remove collection
    </button>
  ),
}));

const collection = {
  id: 'collection-1',
  userId: 'owner-1',
  name: 'Weekend picks',
  description: 'A short list.',
  privacy: DataPrivacy.Friends,
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-01-02'),
  owner: { id: 'owner-1', username: 'owner' },
  members: [],
  memberCount: 1,
  access: {
    relationship: 'owner' as const,
    role: 'owner' as const,
    canView: true as const,
    canEditItems: true,
    canManageSharing: true,
  },
  media: [],
};

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return renderWithProviders(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/app/collections/collection-1']}>
        <Routes>
          <Route path="/app/collections/:id" element={<CollectionDetailsPage />} />
          <Route path="/app/collections" element={<div>Collections index</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('Collection details page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isUnavailableCollectionError.mockReturnValue(false);
    mocks.useCollection.mockReturnValue({
      data: collection,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('renders collection metadata, content, actions, and a back link', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Weekend picks' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to collections' })).toHaveAttribute('href', '/app/collections');
    expect(screen.getByText('0 items')).toBeInTheDocument();
    expect(screen.getByText('Visible to friends')).toBeInTheDocument();
    expect(screen.getByText('Contents of Weekend picks')).toBeInTheDocument();
  });

  it('returns to the collection list after deleting or leaving the collection', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Remove collection' }));

    expect(screen.getByText('Collections index')).toBeInTheDocument();
  });

  it('clears and explains a collection that is no longer available', () => {
    const unavailableError = new Error('gone');
    mocks.isUnavailableCollectionError.mockReturnValue(true);
    mocks.useCollection.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: unavailableError,
      refetch: vi.fn(),
    });

    renderPage();

    expect(screen.getByText(/This collection is no longer available/)).toBeInTheDocument();
    expect(mocks.clearUnavailableCollection).toHaveBeenCalledWith(expect.anything(), 'collection-1');
  });
});
