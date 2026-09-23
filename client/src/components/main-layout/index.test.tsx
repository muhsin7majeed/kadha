import { lazy } from 'react';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

vi.mock('@/components/navbar', () => ({ default: () => <div>Primary navigation</div> }));
vi.mock('@/components/tabbar', () => ({ default: () => <div>Mobile navigation</div> }));
vi.mock('@/features/media/api/use-genre-map', () => ({ useGenreMap: vi.fn() }));

import MainLayout from '.';

const PendingPage = lazy(() => new Promise<never>(() => undefined));

describe('MainLayout', () => {
  it('keeps application navigation mounted while a lazy page loads', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route path="/app" element={<MainLayout />}>
            <Route index element={<PendingPage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Primary navigation')).toBeInTheDocument();
    expect(screen.getByText('Mobile navigation')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Loading page');
  });
});
