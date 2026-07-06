import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { User } from '@/features/user/user.types';
import { renderWithProviders } from '@/test/render';
import { DataPrivacy, UserRole } from '@/types/common';

import AdminRoute from './admin-route';
import PrivateRoute from './private-route';
import PublicRoute from './public-route';

type AuthState =
  | {
      status: 'pending' | 'unauthenticated';
      user: null;
    }
  | {
      status: 'authenticated';
      user: User;
    };

const authMock = vi.hoisted(() => ({
  useAuth: vi.fn<() => AuthState>(),
}));

vi.mock('@/features/auth/use-auth', () => ({
  useAuth: authMock.useAuth,
}));

const makeUser = (role: UserRole): User => ({
  id: role === UserRole.Admin ? 'admin-1' : 'user-1',
  username: role === UserRole.Admin ? 'admin' : 'member',
  role,
  profilePrivacy: DataPrivacy.Everyone,
  watchedPrivacy: DataPrivacy.Everyone,
  likedPrivacy: DataPrivacy.Everyone,
  watchlistPrivacy: DataPrivacy.Everyone,
  watchRegion: 'US',
});

const renderPrivateRoute = () =>
  renderWithProviders(
    <MemoryRouter initialEntries={['/app']}>
      <Routes>
        <Route path="/app" element={<PrivateRoute />}>
          <Route index element={<div>Protected page</div>} />
        </Route>
        <Route path="/auth/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );

const renderPublicRoute = () =>
  renderWithProviders(
    <MemoryRouter initialEntries={['/auth/login']}>
      <Routes>
        <Route path="/auth/login" element={<PublicRoute />}>
          <Route index element={<div>Public auth page</div>} />
        </Route>
        <Route path="/app" element={<div>App page</div>} />
      </Routes>
    </MemoryRouter>,
  );

const renderAdminRoute = () =>
  renderWithProviders(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<div>Admin page</div>} />
        </Route>
        <Route path="/app" element={<div>App page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('route guards', () => {
  beforeEach(() => {
    authMock.useAuth.mockReset();
  });

  it('renders protected routes for authenticated users', () => {
    authMock.useAuth.mockReturnValue({ status: 'authenticated', user: makeUser(UserRole.User) });

    renderPrivateRoute();

    expect(screen.getByText('Protected page')).toBeInTheDocument();
  });

  it('redirects unauthenticated users away from protected routes', () => {
    authMock.useAuth.mockReturnValue({ status: 'unauthenticated', user: null });

    renderPrivateRoute();

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders public auth routes for unauthenticated users', () => {
    authMock.useAuth.mockReturnValue({ status: 'unauthenticated', user: null });

    renderPublicRoute();

    expect(screen.getByText('Public auth page')).toBeInTheDocument();
  });

  it('redirects authenticated users away from public auth routes', () => {
    authMock.useAuth.mockReturnValue({ status: 'authenticated', user: makeUser(UserRole.User) });

    renderPublicRoute();

    expect(screen.getByText('App page')).toBeInTheDocument();
  });

  it('renders admin routes for admin users', () => {
    authMock.useAuth.mockReturnValue({ status: 'authenticated', user: makeUser(UserRole.Admin) });

    renderAdminRoute();

    expect(screen.getByText('Admin page')).toBeInTheDocument();
  });

  it('redirects non-admin users away from admin routes', () => {
    authMock.useAuth.mockReturnValue({ status: 'authenticated', user: makeUser(UserRole.User) });

    renderAdminRoute();

    expect(screen.getByText('App page')).toBeInTheDocument();
  });
});
