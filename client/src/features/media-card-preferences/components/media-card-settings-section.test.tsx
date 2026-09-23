import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  data: { version: 1 as const, style: 'detailed' as 'detailed' | 'minimal' },
  isLoading: false,
  isError: false,
  isPending: false,
  update: vi.fn(),
}));
vi.mock('@/features/media-card-preferences/api/use-media-card-preferences', () => ({
  default: () => ({ data: mocks.data, isLoading: mocks.isLoading, isError: mocks.isError }),
}));
vi.mock('@/features/media-card-preferences/api/use-update-media-card-preferences', () => ({
  default: () => ({ mutate: mocks.update, isPending: mocks.isPending }),
}));

import MediaCardSettingsSection from './media-card-settings-section';

describe('MediaCardSettingsSection', () => {
  beforeEach(() => {
    mocks.data = { version: 1, style: 'detailed' };
    mocks.isLoading = false;
    mocks.isError = false;
    mocks.isPending = false;
    mocks.update.mockReset();
  });

  it('selects the saved style and saves a new choice', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MediaCardSettingsSection />);
    expect(screen.getByRole('radio', { name: /Detailed/ })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: /Minimal/ }));
    expect(mocks.update).toHaveBeenCalledWith({ version: 1, style: 'minimal' });
  });

  it('does not show a writable default while loading or on failure', () => {
    mocks.isLoading = true;
    const view = renderWithProviders(<MediaCardSettingsSection />);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    view.unmount();
    mocks.isLoading = false;
    mocks.isError = true;
    renderWithProviders(<MediaCardSettingsSection />);
    expect(screen.getByText(/Could not load card style/)).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});
