import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import FeedbackDetail from './feedback-detail';

vi.mock('@/features/feedback/api/use-feedback-item', () => ({
  default: () => ({
    data: {
      id: 'feedback-1',
      category: 'GENERAL',
      subject: 'Subject only',
      message: '',
      status: 'NEW',
      sourcePath: null,
      appVersion: null,
      adminResponse: null,
      acknowledgedAt: null,
      resolvedAt: null,
      createdAt: '2026-09-14T12:00:00.000Z',
      updatedAt: '2026-09-14T12:00:00.000Z',
    },
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
}));

describe('FeedbackDetail', () => {
  it('shows a fallback when no message was provided', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/app/feedback/feedback-1']}>
        <Routes>
          <Route path="/app/feedback/:id" element={<FeedbackDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('No message provided.')).toBeInTheDocument();
  });
});
