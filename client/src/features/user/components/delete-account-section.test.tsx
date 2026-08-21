import { fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import DeleteAccountSection, { DELETE_ACCOUNT_CONFIRMATION } from './delete-account-section';

const mocks = vi.hoisted(() => ({
  deleteAccount: vi.fn(),
  exportUserData: vi.fn(),
  refetchImpact: vi.fn(),
  resetDelete: vi.fn(),
}));

const impact = {
  impactFingerprint: 'impact-fingerprint',
  isFinalAdministrator: false,
  ownedCollectionCount: 2,
  unsharedOwnedCollectionCount: 1,
  membershipsToLeaveCount: 3,
  sharedOwnedCollections: [
    {
      id: 'collection-1',
      name: 'Weekend Watchlist',
      itemCount: 18,
      automaticRecipientUserId: 'member-1',
      members: [
        {
          memberId: 'membership-1',
          userId: 'member-1',
          username: 'asha',
          role: 'editor' as const,
          joinedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    },
  ],
};

vi.mock('@/features/user/api/use-deletion-impact', () => ({
  default: () => ({
    data: impact,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: mocks.refetchImpact,
  }),
}));

vi.mock('@/features/user/api/use-delete-account', () => ({
  default: () => ({
    mutate: mocks.deleteAccount,
    error: null,
    isPending: false,
    reset: mocks.resetDelete,
  }),
}));

vi.mock('@/features/user/api/use-export-user-data', () => ({
  default: () => ({ mutate: mocks.exportUserData, isPending: false }),
}));

vi.mock('@/features/auth/session', () => ({ clearSession: vi.fn() }));

describe('DeleteAccountSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.refetchImpact.mockResolvedValue({ data: impact, isError: false });
  });

  it('shows collaboration impact and submits explicit ownership choices', async () => {
    renderWithProviders(
      <MemoryRouter>
        <DeleteAccountSection />
      </MemoryRouter>,
    );

    expect(screen.getByText('Deleting your account will:')).toBeInTheDocument();
    expect(screen.getByText(/Remove you from 3 collections/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: /Automatically transfer each shared collection to its earliest-added eligible member/,
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Review shared collections' }));

    const ownerSelect = await screen.findByRole('combobox', { name: 'New owner' });
    fireEvent.change(ownerSelect, { target: { value: 'delete' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save ownership plan' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Review shared collections' })).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete my account' }));
    await screen.findByRole('heading', { name: 'Permanently delete your account?' });

    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Type the confirmation phrase'), {
      target: { value: DELETE_ACCOUNT_CONFIRMATION },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Permanently delete account' }));

    await waitFor(() => {
      expect(mocks.deleteAccount).toHaveBeenCalledWith(
        {
          currentPassword: 'password123',
          confirmation: DELETE_ACCOUNT_CONFIRMATION,
          impactFingerprint: 'impact-fingerprint',
          ownershipPlan: {
            automaticallyTransferEligibleCollections: true,
            overrides: [{ collectionId: 'collection-1', action: 'delete' }],
          },
        },
        expect.any(Object),
      );
    });
  }, 10_000);
});
