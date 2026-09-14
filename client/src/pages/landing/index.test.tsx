import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';
import Landing from './index';

describe('Landing', () => {
  it('explains the hosted beta end-to-end encryption tradeoff near the top of the page', () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    renderWithProviders(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: 'A note about end-to-end encryption' })).toBeInTheDocument();
    expect(screen.getByText(/Kadha is built by one developer/)).toBeInTheDocument();
    expect(screen.getByText(/I can technically access it as the server operator/)).toBeInTheDocument();
    expect(screen.getByText(/sustained demand/)).toBeInTheDocument();
  });
});
