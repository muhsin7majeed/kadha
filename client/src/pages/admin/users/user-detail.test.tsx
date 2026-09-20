import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { UserRole } from '@/types/common';
import AdminUserDetail from './user-detail';

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
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
  useAuth: () => ({ status: 'authenticated', user: { id: 'admin-user-id' } }),
}));

describe('AdminUserDetail', () => {
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
});
