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

    expect(screen.getByRole('heading', { name: "Why Kadha isn't end-to-end encrypted—yet" })).toBeInTheDocument();
    expect(screen.getByText(/Kadha is built by two people/)).toBeInTheDocument();
    expect(screen.getByText(/the server operator can technically access it/)).toBeInTheDocument();
    expect(screen.getByText(/sustained user demand/)).toBeInTheDocument();
  });
});
