import { fireEvent, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { DataPrivacy } from '@/types/common';
import type { Collection, ProfileCollectionSummary } from '../collections.types';
import CollectionList from './collection-list';

const ownedCollection: Collection = {
  id: 'owned-1',
  userId: 'owner-1',
  name: 'Weekend watchlist',
  description: 'Comfort movies and short series for a quiet weekend.',
  privacy: DataPrivacy.Friends,
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-01-02'),
  itemCount: 12,
  memberCount: 4,
  owner: { id: 'owner-1', username: 'muhsin' },
  members: [
    {
      id: 'member-1',
      userId: 'user-1',
      role: 'editor',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      user: { id: 'user-1', username: 'amina' },
    },
    {
      id: 'member-2',
      userId: 'user-2',
      role: 'viewer',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      user: { id: 'user-2', username: 'salim' },
    },
    {
      id: 'member-3',
      userId: 'user-3',
      role: 'viewer',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      user: { id: 'user-3', username: 'layla' },
    },
  ],
  access: {
    relationship: 'owner',
    role: 'owner',
    canView: true,
    canEditItems: true,
    canManageSharing: true,
  },
};

const sharedCollection: Collection = {
  ...ownedCollection,
  id: 'shared-1',
  userId: 'other-owner',
  name: 'Shared picks',
  privacy: DataPrivacy.KadhaUsers,
  memberCount: 2,
  owner: { id: 'other-owner', username: 'nora' },
  members: [ownedCollection.members![0]],
  access: {
    relationship: 'member',
    role: 'editor',
    canView: true,
    canEditItems: true,
    canManageSharing: false,
  },
};

const Location = () => {
  const location = useLocation();
  return <output>{location.pathname}</output>;
};

describe('CollectionList', () => {
  it('renders semantic linked owner summaries with bounded people and distinct sharing metadata', () => {
    const action = vi.fn();

    renderWithProviders(
      <MemoryRouter initialEntries={['/app/collections']}>
        <CollectionList
          collections={[ownedCollection, sharedCollection]}
          getDetailsPath={(collection) => `/app/collections/${collection.id}`}
          showPeople
          renderActions={(collection) => (
            <button type="button" onClick={() => action(collection.id)}>
              Actions for {collection.name}
            </button>
          )}
        />
        <Location />
      </MemoryRouter>,
    );

    const list = screen.getByRole('list', { name: 'Collections' });
    expect(list.tagName).toBe('UL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);

    expect(screen.getByRole('link', { name: /Weekend watchlist/ })).toHaveAttribute(
      'href',
      '/app/collections/owned-1',
    );
    expect(screen.getAllByText('12 items')).toHaveLength(2);
    expect(screen.getByText('Visible to friends')).toBeInTheDocument();
    expect(screen.getByText('Shared with 3 people')).toBeInTheDocument();
    expect(screen.getByText('muhsin, amina, salim +1')).toBeInTheDocument();
    expect(screen.getByText('Created by nora')).toBeInTheDocument();
    expect(screen.getByText('You can edit')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Actions for Weekend watchlist' }));
    expect(action).toHaveBeenCalledWith('owned-1');
    expect(screen.getByText('/app/collections')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /Weekend watchlist/ }));
    expect(screen.getByText('/app/collections/owned-1')).toBeInTheDocument();
  });

  it('renders profile summaries without collaborator identities or member metadata', () => {
    const profileCollection: ProfileCollectionSummary = {
      id: 'public-1',
      name: 'Public picks',
      description: 'A public collection.',
      privacy: DataPrivacy.Public,
      created_at: new Date('2026-01-01'),
      updated_at: new Date('2026-01-02'),
      itemCount: 3,
    };

    renderWithProviders(
      <MemoryRouter>
        <CollectionList
          collections={[profileCollection]}
          getDetailsPath={(collection) => `/share/collections/${collection.id}`}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /Public picks/ })).toHaveAttribute('href', '/share/collections/public-1');
    expect(screen.getByText('3 items')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.queryByText(/members|Created by|Shared with|You can/)).not.toBeInTheDocument();
  });
});
