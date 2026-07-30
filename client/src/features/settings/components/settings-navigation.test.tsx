import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';

import SettingsNavigation from './settings-navigation';

const LocationProbe = () => {
  const location = useLocation();

  return <output aria-label="Current path">{location.pathname}</output>;
};

const renderNavigation = (path = '/app/settings/account') =>
  renderWithProviders(
    <MemoryRouter initialEntries={[path]}>
      <SettingsNavigation />
      <LocationProbe />
    </MemoryRouter>,
  );

describe('SettingsNavigation', () => {
  it('shows every settings category and marks the current section', () => {
    renderNavigation('/app/settings/privacy');

    const desktopNavigation = screen.getByRole('navigation', { hidden: true });

    expect(desktopNavigation).toHaveAttribute('aria-label', 'Settings sections');
    expect(within(desktopNavigation).getByRole('link', { name: 'Account', hidden: true })).toBeInTheDocument();
    expect(within(desktopNavigation).getByRole('link', { name: 'Privacy', hidden: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(desktopNavigation).getByRole('link', { name: 'Appearance', hidden: true })).toBeInTheDocument();
    expect(within(desktopNavigation).getByRole('link', { name: 'Security', hidden: true })).toBeInTheDocument();
    expect(within(desktopNavigation).getByRole('link', { name: 'Data', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Settings section' })).toHaveValue('privacy');
  });

  it('navigates from the mobile section picker', async () => {
    const user = userEvent.setup();
    renderNavigation();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Settings section' }), 'security');

    expect(screen.getByRole('status', { name: 'Current path' })).toHaveTextContent('/app/settings/security');
  });
});
