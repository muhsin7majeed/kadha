import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { UserRole } from '@/types/common';
import AdminUserDetail from './user-detail';

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  authUserId: 'admin-user-id',
}));

vi.mock('@/features/admin/api/use-admin-user', () => ({
  default: () => ({
    data: {
      id: 'target-user-id',
      username: 'target-user',
      role: UserRole.User,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      profilePrivacy: 'ONLY_ME',
      watchedPrivacy: 'ONLY_ME',
      likedPrivacy: 'ONLY_ME',
      watchlistPrivacy: 'ONLY_ME',
      watchedCount: 0,
      likedCount: 0,
      watchlistCount: 0,
      collectionCount: 0,
      friendCount: 0,
      pendingSentFriendRequestCount: 0,
      pendingReceivedFriendRequestCount: 0,
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/features/admin/api/use-update-admin-user-role', () => ({
  default: () => ({ mutate: mocks.mutate, isPending: false }),
}));

vi.mock('@/features/auth/use-auth', () => ({
  useAuth: () => ({ status: 'authenticated', user: { id: mocks.authUserId } }),
}));

describe('AdminUserDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authUserId = 'admin-user-id';
  });

  it('labels administrator-visible support metadata without exposing private records', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/app/admin/users/target-user-id']}>
        <AdminUserDetail />
      </MemoryRouter>,
    );

    expect(screen.getByText('Administrator-visible account details')).toBeInTheDocument();
    expect(screen.getByText('Privacy settings')).toBeInTheDocument();
    expect(screen.getByText('Aggregate support totals')).toBeInTheDocument();
    expect(screen.getByText('target-user-id')).toBeInTheDocument();
    expect(screen.getAllByText('Only Me')).not.toHaveLength(0);
    expect(screen.queryByText('Password')).not.toBeInTheDocument();
    expect(screen.queryByText('Recovery code')).not.toBeInTheDocument();
  });

  it('confirms and submits a user promotion', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <MemoryRouter initialEntries={['/app/admin/users/target-user-id']}>
        <AdminUserDetail />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Make admin' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Make admin', exact: true }));

    expect(mocks.mutate).toHaveBeenCalledWith({ id: 'target-user-id', role: UserRole.Admin }, expect.anything());
  });

  it('does not offer role changes for the signed-in administrator', () => {
    mocks.authUserId = 'target-user-id';

    renderWithProviders(
      <MemoryRouter initialEntries={['/app/admin/users/target-user-id']}>
        <AdminUserDetail />
      </MemoryRouter>,
    );

    expect(screen.getByText('You cannot change your own role.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Make admin' })).not.toBeInTheDocument();
  });
});
