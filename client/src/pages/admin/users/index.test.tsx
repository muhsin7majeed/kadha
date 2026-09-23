import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import AdminUsers from '.';

const adminUsersQuery = vi.fn();

vi.mock('@/features/admin/api/use-admin-users', () => ({
  default: (params: unknown) => {
    adminUsersQuery(params);
    return {
      data: {
        data: [
          {
            id: 'user-1',
            username: 'target-user',
            role: 'USER',
            createdAt: '2026-01-02T00:00:00.000Z',
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
    };
  },
}));

describe('AdminUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a compact account list with readable metadata and detail navigation', () => {
    renderWithProviders(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('columnheader', { hidden: true }).map((header) => header.textContent)).toEqual([
      'Username',
      'Role',
      'Joined',
      'Action',
    ]);

    const row = screen.getByText('target-user').closest('tr');
    expect(row).not.toBeNull();
    expect(within(row!).getByText('User')).toBeInTheDocument();
    expect(within(row!).getAllByText('02 Jan 2026')).not.toHaveLength(0);
    expect(within(row!).getByRole('link', { name: 'View target-user' })).toHaveAttribute(
      'href',
      '/app/admin/users/user-1',
    );
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    expect(screen.queryByText('Collections')).not.toBeInTheDocument();
  });

  it('passes search, role, and useful sorting controls to the user query', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>,
    );

    expect(adminUsersQuery).toHaveBeenCalledWith(
      expect.objectContaining({ query: '', role: 'ALL', sort: 'createdAt', order: 'desc' }),
    );

    await user.type(screen.getByRole('textbox', { name: 'Search username' }), 'target');
    await waitFor(() => {
      expect(adminUsersQuery).toHaveBeenLastCalledWith(expect.objectContaining({ query: 'target' }));
    });

    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by role' }), 'ADMIN');
    expect(adminUsersQuery).toHaveBeenLastCalledWith(expect.objectContaining({ role: 'ADMIN' }));

    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort users' }), 'username');
    expect(adminUsersQuery).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'username' }));

    await user.selectOptions(screen.getByRole('combobox', { name: 'Sort order' }), 'asc');
    expect(adminUsersQuery).toHaveBeenLastCalledWith(expect.objectContaining({ order: 'asc' }));
    expect(screen.getByRole('combobox', { name: 'Sort users' })).not.toHaveTextContent('Updated date');
  });
});
