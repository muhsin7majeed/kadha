import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

vi.mock('@/features/upcoming/components/upcoming-page-content', () => ({
  default: () => <div>Upcoming schedule content</div>,
}));

import Upcoming from '.';

describe('Upcoming page', () => {
  it('presents the private tracked schedule rather than a discovery feed', () => {
    renderWithProviders(
      <MemoryRouter>
        <Upcoming />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Upcoming' })).toBeInTheDocument();
    expect(screen.getByText(/episodes and releases for titles you track/i)).toBeInTheDocument();
    expect(screen.getByText(/dates can change as providers update their listings/i)).toBeInTheDocument();
    expect(screen.queryByText(/visible only to you/i)).not.toBeInTheDocument();
    expect(screen.getByText('Upcoming schedule content')).toBeInTheDocument();
  });
});
