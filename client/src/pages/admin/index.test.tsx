import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminOverview } from '@/features/admin/admin.types';
import { renderWithProviders } from '@/test/render';

import AdminOverviewPage from '.';

const overviewQuery = vi.hoisted(() => vi.fn());

vi.mock('@/features/admin/api/use-admin-overview', () => ({
  default: overviewQuery,
}));

const overview: AdminOverview = {
  totalUsers: 12,
  newUsersLast7Days: 2,
  newUsersLast30Days: 5,
  totalTrackedMediaRows: 84,
  totalCollections: 7,
  totalFriendships: 3,
  totalNotifications: 10,
  totalAdmins: 1,
  appName: 'My Film Shelf',
  appVersion: '0.6.0',
  generatedAt: '2026-09-23T00:00:00.000Z',
  users: {
    total: 12,
    newLast7Days: 2,
    newLast30Days: 5,
    recordedActiveLast7Days: 6,
    recordedActiveLast30Days: 9,
    trend: [
      { date: '2026-09-22', newUsers: 1, recordedActiveUsers: 4 },
      { date: '2026-09-23', newUsers: 1, recordedActiveUsers: 3 },
    ],
  },
  feedback: {
    newCount: 1,
    openCount: 2,
    recentOpen: [
      {
        id: 'feedback-1',
        category: 'BUG',
        subject: 'Calendar problem',
        status: 'NEW',
        username: 'ashe',
        createdAt: '2026-09-22T18:00:00.000Z',
      },
    ],
  },
  provider: {
    status: 'available',
    range: '24h',
    from: '2026-09-22T00:00:00.000Z',
    to: '2026-09-23T00:00:00.000Z',
    summary: {
      requestCount: 25,
      successCount: 23,
      errorCount: 2,
      rateLimitedCount: 1,
      cacheHitCount: 10,
      totalDurationMs: 1250,
      averageDurationMs: 50,
      cacheHitRate: 10 / 35,
    },
  },
  instanceData: {
    trackedMediaRows: 84,
    collections: 7,
    acceptedFriendships: 3,
    admins: 1,
  },
};

describe('AdminOverviewPage', () => {
  beforeEach(() => {
    overviewQuery.mockReturnValue({
      data: overview,
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    });
  });

  it('renders action-first instance, feedback, user, and provider summaries', () => {
    renderWithProviders(
      <MemoryRouter>
        <AdminOverviewPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Administration' })).toBeInTheDocument();
    expect(screen.getByText('My Film Shelf')).toBeInTheDocument();
    expect(screen.getByText('Calendar problem')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Calendar problem/ })).toHaveAttribute(
      'href',
      '/app/admin/feedback/feedback-1',
    );
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('50 ms')).toBeInTheDocument();
    expect(screen.getByText('Recorded activity includes sign-ins and saved account changes.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh dashboard' })).toBeInTheDocument();
  });

  it('shows provider metrics as unavailable without hiding the rest of the dashboard', () => {
    overviewQuery.mockReturnValue({
      data: { ...overview, provider: { status: 'unavailable', range: '24h' } },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    renderWithProviders(
      <MemoryRouter>
        <AdminOverviewPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Provider metrics are temporarily unavailable.')).toBeInTheDocument();
    expect(screen.getByText('Calendar problem')).toBeInTheDocument();
  });
});
