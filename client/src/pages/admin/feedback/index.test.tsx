import { screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import AdminFeedback from '.';
import AdminFeedbackDetail from './feedback-detail';

const updateFeedback = vi.fn();
const adminFeedbackQuery = vi.fn();

vi.mock('@/features/feedback/api/use-admin-feedback-item', () => ({
  default: () => ({ data: { id: 'feedback-1', category: 'BUG', subject: 'Calendar problem', message: '', status: 'NEW', username: 'ashe', sourcePath: '/app/diary', appVersion: '0.2.0', adminResponse: null, acknowledgedAt: null, resolvedAt: null, createdAt: '2026-09-14T12:00:00.000Z', updatedAt: '2026-09-14T12:00:00.000Z' }, isLoading: false, isError: false, isFetching: false, refetch: vi.fn() }),
}));
vi.mock('@/features/feedback/api/use-update-feedback', () => ({ default: () => ({ mutateAsync: updateFeedback, isPending: false }) }));

vi.mock('@/features/feedback/api/use-admin-feedback', () => ({
  default: (params: unknown) => {
    adminFeedbackQuery(params);
    return {
      data: {
        data: [{ id: 'feedback-1', category: 'BUG', subject: 'Calendar problem', status: 'NEW', username: 'ashe', sourcePath: '/app/diary', appVersion: '0.2.0', acknowledgedAt: null, resolvedAt: null, createdAt: '2026-09-14T12:00:00.000Z', updatedAt: '2026-09-14T12:00:00.000Z' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
        summary: { newCount: 1, openCount: 2, acknowledgedCount: 1, completedCount: 3, notPlannedCount: 4 },
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    };
  },
}));

describe('AdminFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('defaults to the open inbox and exposes status counts as filters', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MemoryRouter><AdminFeedback /></MemoryRouter>);

    expect(adminFeedbackQuery).toHaveBeenCalledWith(expect.objectContaining({ status: 'OPEN' }));
    expect(screen.getByRole('tab', { name: 'Open 2' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'New 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Acknowledged 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Completed 3' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Not planned 4' })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Completed 3' }));
    expect(adminFeedbackQuery).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'COMPLETED' }));
  });

  it('shows readable submission details and links to feedback details', () => {
    renderWithProviders(<MemoryRouter><AdminFeedback /></MemoryRouter>);
    expect(screen.getByRole('combobox', { name: 'Filter by category' })).toBeInTheDocument();
    const row = screen.getByText('Calendar problem').closest('tr');
    expect(row).not.toBeNull();
    expect(within(row!).getAllByText('Bug')).not.toHaveLength(0);
    expect(within(row!).getByText('New')).toBeInTheDocument();
    expect(within(row!).getAllByText(/ago/)).not.toHaveLength(0);
    expect(within(row!).getByRole('link', { name: 'View Calendar problem' })).toHaveAttribute(
      'href',
      '/app/admin/feedback/feedback-1',
    );
  });

  it('synchronizes the editor with the canonical status returned by an update', async () => {
    const user = userEvent.setup();
    updateFeedback.mockResolvedValueOnce({
      id: 'feedback-1',
      status: 'ACKNOWLEDGED',
      adminResponse: 'Thanks for reporting this.',
    });
    renderWithProviders(<MemoryRouter initialEntries={['/app/admin/feedback/feedback-1']}><Routes><Route path="/app/admin/feedback/:id" element={<AdminFeedbackDetail />} /></Routes></MemoryRouter>);
    expect(screen.getByText('Submitted message')).toBeInTheDocument();
    expect(screen.getByText('No message provided.')).toBeInTheDocument();
    expect(screen.getByText('Submission details')).toBeInTheDocument();
    expect(screen.getByText('/app/diary')).toBeInTheDocument();
    expect(screen.getByText('0.2.0')).toBeInTheDocument();
    const status = screen.getByLabelText('Status');
    expect(status).toHaveValue('NEW');
    await user.type(screen.getByLabelText('Response to user'), 'Thanks for reporting this.');
    await user.click(screen.getByRole('button', { name: 'Save update' }));
    expect(updateFeedback).toHaveBeenCalledWith({ id: 'feedback-1', status: 'NEW', adminResponse: 'Thanks for reporting this.' });
    expect(status).toHaveValue('ACKNOWLEDGED');
  });

});
