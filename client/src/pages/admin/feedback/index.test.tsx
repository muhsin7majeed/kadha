import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import AdminFeedback from '.';

vi.mock('@/features/feedback/api/use-admin-feedback', () => ({
  default: () => ({
    data: {
      data: [{ id: 'feedback-1', category: 'BUG', subject: 'Calendar problem', status: 'NEW', username: 'ashe', sourcePath: '/app/diary', appVersion: '0.2.0', acknowledgedAt: null, resolvedAt: null, createdAt: '2026-09-14T12:00:00.000Z', updatedAt: '2026-09-14T12:00:00.000Z' }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}));

describe('AdminFeedback', () => {
  it('shows triage filters and links to feedback details', () => {
    renderWithProviders(<MemoryRouter><AdminFeedback /></MemoryRouter>);
    expect(screen.getByRole('combobox', { name: 'Filter by status' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Filter by category' })).toBeInTheDocument();
    expect(screen.getByText('Calendar problem')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute('href', '/app/admin/feedback/feedback-1');
  });
});
