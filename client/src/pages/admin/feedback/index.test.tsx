import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import AdminFeedback from '.';
import AdminFeedbackDetail from './feedback-detail';

const updateFeedback = vi.fn();

vi.mock('@/features/feedback/api/use-admin-feedback-item', () => ({
  default: () => ({ data: { id: 'feedback-1', category: 'BUG', subject: 'Calendar problem', message: 'A detailed problem report.', status: 'NEW', username: 'ashe', sourcePath: '/app/diary', appVersion: '0.2.0', adminResponse: null, acknowledgedAt: null, resolvedAt: null, createdAt: '2026-09-14T12:00:00.000Z', updatedAt: '2026-09-14T12:00:00.000Z' }, isLoading: false, isError: false, isFetching: false, refetch: vi.fn() }),
}));
vi.mock('@/features/feedback/api/use-update-feedback', () => ({ default: () => ({ mutateAsync: updateFeedback, isPending: false }) }));

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
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('shows triage filters and links to feedback details', () => {
    renderWithProviders(<MemoryRouter><AdminFeedback /></MemoryRouter>);
    expect(screen.getByRole('combobox', { name: 'Filter by status' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Filter by category' })).toBeInTheDocument();
    expect(screen.getByText('Calendar problem')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute('href', '/app/admin/feedback/feedback-1');
  });

  it('synchronizes the editor with the canonical status returned by an update', async () => {
    const user = userEvent.setup();
    updateFeedback.mockResolvedValueOnce({
      id: 'feedback-1',
      status: 'ACKNOWLEDGED',
      adminResponse: 'Thanks for reporting this.',
    });
    renderWithProviders(<MemoryRouter initialEntries={['/app/admin/feedback/feedback-1']}><Routes><Route path="/app/admin/feedback/:id" element={<AdminFeedbackDetail />} /></Routes></MemoryRouter>);
    const status = screen.getByLabelText('Status');
    expect(status).toHaveValue('NEW');
    await user.type(screen.getByLabelText('Response to user'), 'Thanks for reporting this.');
    await user.click(screen.getByRole('button', { name: 'Save update' }));
    expect(updateFeedback).toHaveBeenCalledWith({ id: 'feedback-1', status: 'NEW', adminResponse: 'Thanks for reporting this.' });
    expect(status).toHaveValue('ACKNOWLEDGED');
  });

});
