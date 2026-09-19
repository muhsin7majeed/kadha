import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_HOME_PREFERENCES } from '@/features/home/home-defaults';
import type { HomePreferences } from '@/features/home/home.types';
import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  preferences: null as HomePreferences | null,
  isLoading: false,
  isPending: false,
  update: vi.fn(),
}));

vi.mock('@/features/home/api/use-home-preferences', () => ({
  default: () => ({
    data: mocks.preferences ?? DEFAULT_HOME_PREFERENCES,
    isLoading: mocks.isLoading,
  }),
}));

vi.mock('@/features/home/api/use-update-home-preferences', () => ({
  default: () => ({ mutateAsync: mocks.update, isPending: mocks.isPending }),
}));

import HomeSettingsSection from './home-settings-section';

describe('HomeSettingsSection', () => {
  beforeEach(() => {
    mocks.preferences = structuredClone(DEFAULT_HOME_PREFERENCES);
    mocks.isLoading = false;
    mocks.isPending = false;
    mocks.update.mockReset();
    mocks.update.mockImplementation(async (preferences: HomePreferences) => preferences);
  });

  it('loads saved order and visibility', () => {
    mocks.preferences = {
      version: 1,
      items: [
        { id: 'recommendations', visible: true },
        { id: 'watchlist', visible: false },
        { id: 'continue-watching', visible: true },
        { id: 'trending-movies', visible: true },
        { id: 'trending-tv', visible: true },
      ],
    };

    renderWithProviders(<HomeSettingsSection />);

    expect(screen.getAllByRole('button', { name: /^Drag / })[0]).toHaveAccessibleName('Drag For You');
    expect(screen.getByRole('checkbox', { name: 'Show From Your Watchlist on Home' })).not.toBeChecked();
  });

  it('reorders, hides a section, and saves the complete preferences', async () => {
    const user = userEvent.setup();
    renderWithProviders(<HomeSettingsSection />);

    await user.click(screen.getByRole('button', { name: 'Move From Your Watchlist up' }));
    await user.click(screen.getByRole('checkbox', { name: 'Show Trending TV on Home' }));
    await user.click(screen.getByRole('button', { name: 'Save Home settings' }));

    expect(mocks.update).toHaveBeenCalledTimes(1);
    const saved = mocks.update.mock.calls[0][0] as HomePreferences;
    expect(saved.items[0].id).toBe('watchlist');
    expect(saved.items.find((item) => item.id === 'trending-tv')?.visible).toBe(false);
  });

  it('restores defaults locally without saving immediately', async () => {
    const user = userEvent.setup();
    mocks.preferences = {
      version: 1,
      items: [...structuredClone(DEFAULT_HOME_PREFERENCES.items)].reverse(),
    };
    renderWithProviders(<HomeSettingsSection />);

    await user.click(screen.getByRole('button', { name: 'Restore defaults' }));

    expect(screen.getAllByRole('button', { name: /^Drag / })[0]).toHaveAccessibleName('Drag Continue Watching');
    expect(mocks.update).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save Home settings' })).toBeEnabled();
  });

  it('locks controls while an update is pending', () => {
    mocks.isPending = true;
    renderWithProviders(<HomeSettingsSection />);

    expect(screen.getByRole('button', { name: 'Drag Continue Watching' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Show Continue Watching on Home' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save Home settings' })).toBeDisabled();
  });
});
