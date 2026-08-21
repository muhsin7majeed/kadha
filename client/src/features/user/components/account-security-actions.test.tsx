import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ChangePasswordSection from '@/features/auth/components/change-password-section';
import { renderWithProviders } from '@/test/render';

import DeleteAccountSection, { DELETE_ACCOUNT_CONFIRMATION } from './delete-account-section';

const mocks = vi.hoisted(() => ({
  changePassword: vi.fn(),
  deleteAccount: vi.fn(),
  exportUserData: vi.fn(),
}));

vi.mock('@/features/auth/api/use-change-password', () => ({
  default: () => ({
    error: null,
    isPending: false,
    mutate: mocks.changePassword,
    reset: vi.fn(),
  }),
}));

vi.mock('@/features/auth/use-auth', () => ({
  useAuth: () => ({
    status: 'authenticated',
    user: { username: 'movie-fan' },
  }),
}));

vi.mock('@/features/auth/components/password-guidance', () => ({
  default: () => <div>Password guidance</div>,
}));

vi.mock('@/features/user/api/use-delete-account', () => ({
  default: () => ({
    error: null,
    isPending: false,
    mutate: mocks.deleteAccount,
    reset: vi.fn(),
  }),
}));

vi.mock('@/features/user/api/use-export-user-data', () => ({
  default: () => ({
    isPending: false,
    mutate: mocks.exportUserData,
  }),
}));

const renderInRouter = (component: React.ReactElement) => renderWithProviders(<MemoryRouter>{component}</MemoryRouter>);

describe('sensitive account settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits a password change without sending the confirmation field', async () => {
    renderInRouter(<ChangePasswordSection />);

    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'new-password-456' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'new-password-456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Change password' }));

    await waitFor(() => {
      expect(mocks.changePassword).toHaveBeenCalledWith(
        {
          currentPassword: 'password123',
          newPassword: 'new-password-456',
          confirmNewPassword: 'new-password-456',
        },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });

  it('requires the exact irreversible-action phrase before submitting account deletion', async () => {
    renderInRouter(<DeleteAccountSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }));

    const deleteButton = await screen.findByRole('button', { name: 'Permanently delete account' });
    expect(deleteButton).toBeDisabled();
    expect(screen.getByText(DELETE_ACCOUNT_CONFIRMATION)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Type the confirmation phrase'), {
      target: { value: 'I understand' },
    });
    expect(deleteButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Type the confirmation phrase'), {
      target: { value: DELETE_ACCOUNT_CONFIRMATION },
    });
    expect(deleteButton).toBeEnabled();
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mocks.deleteAccount).toHaveBeenCalledWith(
        {
          currentPassword: 'password123',
          confirmation: DELETE_ACCOUNT_CONFIRMATION,
        },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });
  });
});
