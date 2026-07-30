import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { User } from '@/features/user/user.types';
import { renderWithProviders } from '@/test/render';
import { DataPrivacy, UserRole } from '@/types/common';

import Settings from '.';

const authMock = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/auth/use-auth', () => ({
  useAuth: authMock.useAuth,
}));

vi.mock('@/components/navbar', () => ({
  default: () => <div>Public navigation</div>,
}));

vi.mock('@/features/theme/components/theme-settings-section', () => ({
  default: () => <div>Appearance controls</div>,
}));

const me: User = {
  id: 'user-1',
  username: 'movie-fan',
  role: UserRole.User,
  profilePrivacy: DataPrivacy.Everyone,
  watchedPrivacy: DataPrivacy.Friends,
  likedPrivacy: DataPrivacy.Friends,
  watchlistPrivacy: DataPrivacy.OnlyMe,
  watchRegion: 'US',
};

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the public settings route focused on appearance', () => {
    authMock.useAuth.mockReturnValue({ status: 'unauthenticated', user: null });

    renderWithProviders(
      <MemoryRouter initialEntries={['/settings']}>
        <Settings />
      </MemoryRouter>,
    );

    expect(screen.getByText('Public navigation')).toBeInTheDocument();
    expect(screen.getByText('Appearance controls')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Settings sections' })).not.toBeInTheDocument();
  });

  it('renders category navigation and nested content inside the app', () => {
    authMock.useAuth.mockReturnValue({ status: 'authenticated', user: me });

    renderWithProviders(
      <MemoryRouter initialEntries={['/app/settings/privacy']}>
        <Routes>
          <Route path="/app/settings" element={<Settings />}>
            <Route path="privacy" element={<div>Privacy settings content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('combobox', { name: 'Settings section' })).toHaveValue('privacy');
    expect(screen.getByText('Privacy settings content')).toBeInTheDocument();
  });
});
