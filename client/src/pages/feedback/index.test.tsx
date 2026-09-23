import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import FeedbackPage from '.';

const mocks = vi.hoisted(() => ({ mutateAsync: vi.fn(), refetch: vi.fn() }));
vi.mock('@/features/feedback/api/use-create-feedback', () => ({ default: () => ({ mutateAsync: mocks.mutateAsync, isPending: false }) }));
vi.mock('@/features/feedback/api/use-feedback', () => ({
  default: () => ({
    data: {
      data: [{ id: 'feedback-1', category: 'BUG', subject: 'Existing report', status: 'ACKNOWLEDGED', acknowledgedAt: null, resolvedAt: null, createdAt: '2026-09-14T12:00:00.000Z', updatedAt: '2026-09-14T12:00:00.000Z' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: mocks.refetch,
  }),
}));

describe('FeedbackPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('submits private feedback with source context and shows history', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MemoryRouter initialEntries={[{ pathname: '/app/feedback', state: { sourcePath: '/app/diary' } }]}>
        <FeedbackPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Existing report')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Category'), 'BUG');
    await user.type(screen.getByLabelText('Subject'), 'Calendar problem');
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));

    expect(mocks.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      category: 'BUG',
      subject: 'Calendar problem',
      message: '',
      sourcePath: '/app/diary',
      appVersion: expect.any(String),
    }));
  });
});
