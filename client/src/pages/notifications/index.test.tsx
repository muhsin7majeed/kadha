import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { renderWithProviders } from '@/test/render';
import Notifications from './index';

const mocks = vi.hoisted(() => ({
  markRead: vi.fn(),
}));

vi.mock('@/features/notifications/api/use-notifications', () => ({
  default: () => ({
    data: {
      data: [
        {
          id: 'notification-1',
          userId: 'recipient-1',
          type: 'COLLECTION_OWNERSHIP_RECEIVED',
          read: false,
          actorId: null,
          referenceId: 'collection-1',
          entityType: 'collection',
          entityId: 'collection-1',
          metadata: JSON.stringify({ collectionName: 'Weekend Watchlist' }),
          readAt: null,
          resolvedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/notifications/api/use-mark-notification-read', () => ({
  default: () => ({ mutate: mocks.markRead, isPending: false }),
}));

vi.mock('@/features/notifications/api/use-mark-all-notifications-read', () => ({
  default: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/features/collections/api/use-respond-to-collection-invite', () => ({
  default: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/features/collections/components/collection-details-dialog', () => ({
  default: ({ collectionId, collectionName, open }: { collectionId: string; collectionName: string; open: boolean }) =>
    open ? <div role="dialog">{`${collectionName}:${collectionId}`}</div> : null,
}));

describe('system notifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('opens surviving collection details from a clickable collection name', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    renderWithProviders(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Notifications />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '“Weekend Watchlist”' }));

    expect(screen.getByRole('dialog')).toHaveTextContent('Weekend Watchlist:collection-1');
    expect(mocks.markRead).toHaveBeenCalledWith('notification-1');
    expect(screen.queryByText(/Sent you a notification/)).not.toBeInTheDocument();
  });
});
