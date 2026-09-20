import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { DataPrivacy } from '@/types/common';
import Collections from './index';

const mocks = vi.hoisted(() => ({
  useCollections: vi.fn(),
}));

vi.mock('@/features/collections/api/use-collections', () => ({ default: mocks.useCollections }));
vi.mock('@/features/collections/components/create-collection-button', () => ({
  default: () => <button type="button">Create collection</button>,
}));
vi.mock('@/features/collections/components/collection-menu', () => ({
  default: ({ collection }: { collection: { name: string } }) => (
    <button type="button">Actions for {collection.name}</button>
  ),
}));

const collection = {
  id: 'collection-1',
  userId: 'owner-1',
  name: 'Weekend picks',
  description: 'A short list.',
  privacy: DataPrivacy.OnlyMe,
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-01-02'),
  itemCount: 4,
  memberCount: 1,
  owner: { id: 'owner-1', username: 'owner' },
  members: [],
  access: {
    relationship: 'owner' as const,
    role: 'owner' as const,
    canView: true as const,
    canEditItems: true,
    canManageSharing: true,
  },
};

describe('Collections page', () => {
  beforeEach(() => {
    mocks.useCollections.mockReturnValue({
      data: [collection],
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('renders collection summaries as detail links with independent actions', () => {
    renderWithProviders(
      <MemoryRouter>
        <Collections />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /Weekend picks/ })).toHaveAttribute(
      'href',
      '/app/collections/collection-1',
    );
    expect(screen.getByRole('button', { name: 'Actions for Weekend picks' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /expand|collapse/i })).not.toBeInTheDocument();
  });

  it('keeps collection scope filtering when switching to Shared', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MemoryRouter>
        <Collections />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('tab', { name: 'Shared' }));

    expect(mocks.useCollections).toHaveBeenLastCalledWith({ scope: 'shared' });
  });
});
