import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_NAVIGATION_PREFERENCES } from '@/features/navigation/navigation-defaults';
import type { NavigationPreferences } from '@/features/navigation/navigation.types';
import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  preferences: null as NavigationPreferences | null,
  update: vi.fn(),
}));

vi.mock('@/features/navigation/api/use-navigation-preferences', () => ({
  default: () => ({ data: mocks.preferences ?? DEFAULT_NAVIGATION_PREFERENCES, isLoading: false }),
}));

vi.mock('@/features/navigation/api/use-update-navigation-preferences', () => ({
  default: () => ({ mutateAsync: mocks.update, isPending: false }),
}));

import NavigationSettingsSection from './navigation-settings-section';

const renderSection = () =>
  renderWithProviders(
    <MemoryRouter initialEntries={['/app/settings/navigation']}>
      <NavigationSettingsSection />
    </MemoryRouter>,
  );

describe('NavigationSettingsSection', () => {
  beforeEach(() => {
    mocks.preferences = structuredClone(DEFAULT_NAVIGATION_PREFERENCES);
    mocks.update.mockReset();
    mocks.update.mockImplementation(async (preferences: NavigationPreferences) => preferences);
  });

  it('edits layout, visibility, per-item presentation, and the live preview', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Navigation layout' }), 'scrollable');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Home appearance' }), 'icon');
    await user.click(screen.getByRole('checkbox', { name: 'Show Liked in navigation' }));

    const preview = screen.getByRole('navigation', { name: 'Navigation preview' });
    expect(preview.querySelector('[data-layout="scrollable"]')).toBeInTheDocument();
    expect(within(preview).getByLabelText('Home')).not.toHaveTextContent('Home');
    expect(within(preview).getByText('Liked')).toBeInTheDocument();
  });

  it('reorders with accessible controls and saves the complete configuration', async () => {
    const user = userEvent.setup();
    renderSection();

    await user.click(screen.getByRole('button', { name: 'Move Menu up' }));
    await user.click(screen.getByRole('button', { name: 'Save navigation settings' }));

    expect(mocks.update).toHaveBeenCalledTimes(1);
    const saved = mocks.update.mock.calls[0][0] as NavigationPreferences;
    expect(saved.items.at(-2)?.id).toBe('menu');
    expect(saved.items.at(-1)?.id).toBe('settings');
  });

  it('keeps Home and Menu visible and enforces the Compact limit', async () => {
    const user = userEvent.setup();
    renderSection();

    expect(screen.getByRole('checkbox', { name: 'Show Home in navigation' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Show Menu in navigation' })).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: 'Show Activity in navigation' }));
    expect(screen.getByText(/Compact navigation is full/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Show Watched in navigation' })).toBeDisabled();
  });

  it('restores defaults without saving immediately', async () => {
    const user = userEvent.setup();
    mocks.preferences = {
      ...structuredClone(DEFAULT_NAVIGATION_PREFERENCES),
      layout: 'grid',
    };
    renderSection();

    await user.click(screen.getByRole('button', { name: 'Restore defaults' }));

    expect(screen.getByRole('combobox', { name: 'Navigation layout' })).toHaveValue('compact');
    expect(mocks.update).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Save navigation settings' })).toBeEnabled();
  });
});
