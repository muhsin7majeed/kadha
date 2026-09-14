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

    const heroHeading = screen.getByRole('heading', { name: /Keep track of what you watch/ });
    const disclosureHeading = screen.getByRole('heading', { name: 'A note about end-to-end encryption' });
    const showcaseHeading = screen.getByRole('heading', { name: 'Built around your viewing history' });

    expect(heroHeading.compareDocumentPosition(disclosureHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(disclosureHeading.compareDocumentPosition(showcaseHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText(/Kadha is built by one developer/)).toBeInTheDocument();
    expect(screen.getByText(/the server operator can technically access stored data and backups/)).toBeInTheDocument();
    expect(screen.getByText(/it can move up the roadmap/)).toBeInTheDocument();
  });
});
