import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { DataPrivacy } from '@/types/common';
import OtherUserCollectionsTab from './collections-tab';

vi.mock('@/features/collections/api/use-user-collections', () => ({
  default: () => ({
    data: {
      access: { canView: true },
      data: [
        {
          id: 'public-1',
          name: 'Nora’s favorites',
          description: 'A public shortlist.',
          privacy: DataPrivacy.Public,
          created_at: new Date('2026-01-01'),
          updated_at: new Date('2026-01-02'),
          itemCount: 8,
        },
      ],
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe('profile collection list', () => {
  it('links privacy-safe summaries to the public collection details page', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/u/nora/collections']}>
        <Routes>
          <Route path="/u/:username/collections" element={<OtherUserCollectionsTab />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /Nora’s favorites/ })).toHaveAttribute(
      'href',
      '/share/collections/public-1',
    );
    expect(screen.getByText('8 items')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.queryByText(/members|Shared with|Created by/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /expand|collapse/i })).not.toBeInTheDocument();
  });
});
