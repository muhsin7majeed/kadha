import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { DataPrivacy, UserRole } from '@/types/common';

import AccountSettingsSection from './account-settings-section';
import PrivacySettingsSection from './privacy-settings-section';

const updateMeMock = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
}));

vi.mock('@/features/user/api/use-update-me', () => ({
  default: () => ({
    error: null,
    isPending: false,
    mutateAsync: updateMeMock.mutateAsync,
  }),
}));

const me = {
  id: 'user-1',
  username: 'movie-fan',
  role: UserRole.User,
  profilePrivacy: DataPrivacy.Everyone,
  watchedPrivacy: DataPrivacy.Friends,
  likedPrivacy: DataPrivacy.Friends,
  watchlistPrivacy: DataPrivacy.OnlyMe,
  watchRegion: 'US',
};

describe('user settings sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateMeMock.mutateAsync.mockResolvedValue({});
  });

  it('updates account fields while preserving the current privacy settings', async () => {
    renderWithProviders(<AccountSettingsSection me={me} />);

    const username = screen.getByRole('textbox', { name: 'Username' });
    fireEvent.change(username, { target: { value: 'cinema-fan' } });
    const saveButton = screen.getByRole('button', { name: 'Save account settings' });

    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateMeMock.mutateAsync).toHaveBeenCalledWith({
        username: 'cinema-fan',
        watchRegion: 'US',
        profilePrivacy: DataPrivacy.Everyone,
        watchedPrivacy: DataPrivacy.Friends,
        likedPrivacy: DataPrivacy.Friends,
        watchlistPrivacy: DataPrivacy.OnlyMe,
      });
    });
  });

  it('updates visibility while preserving the current account settings', async () => {
    renderWithProviders(<PrivacySettingsSection me={me} />);

    const profileVisibility = screen.getByRole('radiogroup', { name: 'Profile visibility' });
    fireEvent.click(within(profileVisibility).getByRole('radio', { name: 'Friends' }));
    const saveButton = screen.getByRole('button', { name: 'Save privacy settings' });

    await waitFor(() => expect(saveButton).toBeEnabled());
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateMeMock.mutateAsync).toHaveBeenCalledWith({
        username: 'movie-fan',
        watchRegion: 'US',
        profilePrivacy: DataPrivacy.Friends,
        watchedPrivacy: DataPrivacy.Friends,
        likedPrivacy: DataPrivacy.Friends,
        watchlistPrivacy: DataPrivacy.OnlyMe,
      });
    });
  });
});
