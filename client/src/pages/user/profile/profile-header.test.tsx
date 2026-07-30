import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import type { UserProfileResponse } from '@/features/user/user.types';
import { renderWithProviders } from '@/test/render';
import { DataPrivacy, FriendStatus } from '@/types/common';

import ProfileHeader from './profile-header';

vi.mock('@/features/friendship/components/friendship-actions', () => ({
  default: () => <div>Friendship actions</div>,
}));

const profile: UserProfileResponse = {
  id: 'user-1',
  username: 'movie-fan',
  friendshipStatus: FriendStatus.None,
  isRequestSender: false,
  profilePrivacy: DataPrivacy.Everyone,
  access: {
    canView: true,
  },
  sections: {
    watched: true,
    liked: true,
    watchlist: false,
    collections: true,
  },
};

describe('ProfileHeader', () => {
  it('shows settings shortcuts instead of friendship controls for the owner', () => {
    renderWithProviders(
      <MemoryRouter>
        <ProfileHeader profile={profile} isOwner />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Edit profile' })).toHaveAttribute('href', '/app/settings/account');
    expect(screen.getByRole('link', { name: 'Manage privacy' })).toHaveAttribute('href', '/app/settings/privacy');
    expect(screen.queryByText('Friendship actions')).not.toBeInTheDocument();
  });

  it('keeps friendship controls on another user profile', () => {
    renderWithProviders(
      <MemoryRouter>
        <ProfileHeader profile={profile} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Friendship actions')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit profile' })).not.toBeInTheDocument();
  });
});
