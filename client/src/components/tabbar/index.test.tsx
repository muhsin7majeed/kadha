import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_NAVIGATION_PREFERENCES } from '@/features/navigation/navigation-defaults';
import type { NavigationPreferences } from '@/features/navigation/navigation.types';
import { renderWithProviders } from '@/test/render';

const mocks = vi.hoisted(() => ({
  preferences: null as NavigationPreferences | null,
  loading: false,
}));

vi.mock('@/features/navigation/api/use-navigation-preferences', () => ({
  default: () => ({
    data: mocks.loading ? undefined : mocks.preferences ?? DEFAULT_NAVIGATION_PREFERENCES,
    isError: false,
  }),
}));

import TabBar from '.';

const renderTabBar = (path = '/app', preferences: NavigationPreferences | null = null) => {
  mocks.preferences = preferences;
  mocks.loading = false;
  return renderWithProviders(
    <MemoryRouter initialEntries={[path]}>
      <TabBar />
    </MemoryRouter>,
  );
};

const customize = (
  updates: Partial<NavigationPreferences>,
  itemUpdates: Partial<Record<NavigationPreferences['items'][number]['id'], Partial<NavigationPreferences['items'][number]>>> = {},
): NavigationPreferences => ({
  ...DEFAULT_NAVIGATION_PREFERENCES,
  ...updates,
  items: DEFAULT_NAVIGATION_PREFERENCES.items.map((item) => ({ ...item, ...itemUpdates[item.id] })),
});

describe('TabBar', () => {
  it('shows the default primary destinations and marks the current route', () => {
    renderTabBar('/app/watchlist');

    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'For You' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Watchlist' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Progress' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Collections' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
  });

  it('reveals omitted destinations and navigation customization from Menu', async () => {
    const user = userEvent.setup();
    renderTabBar();

    await user.click(screen.getByRole('button', { name: 'Menu' }));

    expect(screen.getByRole('menuitem', { name: 'Activity' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Watched' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Liked' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Friends' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Customize navigation' })).toHaveAttribute(
      'href',
      '/app/settings/navigation',
    );
    expect(screen.getByRole('menuitem', { name: /mode/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Version/ })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'GitHub' })).toBeInTheDocument();
  });

  it('marks Menu and an omitted destination current when the current route is hidden', async () => {
    const user = userEvent.setup();
    renderTabBar('/app/activity');

    const menu = screen.getByRole('button', { name: 'Menu' });
    expect(menu).toHaveAttribute('aria-current', 'page');
    expect(menu).toHaveAttribute('data-navigation-active');

    await user.click(menu);
    expect(screen.getByRole('menuitem', { name: 'Activity' })).toHaveAttribute('aria-current', 'page');
  });

  it('does not flash the default bar while account preferences are loading', () => {
    mocks.loading = true;
    renderWithProviders(
      <MemoryRouter initialEntries={['/app']}>
        <TabBar />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })).not.toBeInTheDocument();
  });

  it('respects item order and independent icon or label presentation', () => {
    const preferences = customize(
      {},
      {
        home: { display: 'icon' },
        recommendations: { display: 'label' },
      },
    );
    preferences.items = [
      preferences.items.find((item) => item.id === 'menu')!,
      preferences.items.find((item) => item.id === 'home')!,
      ...preferences.items.filter((item) => item.id !== 'menu' && item.id !== 'home'),
    ];

    renderTabBar('/app', preferences);

    const controls = screen.getByRole('navigation', { name: 'Primary navigation' }).querySelectorAll('a, button');
    expect(controls[0]).toHaveAccessibleName('Menu');
    expect(controls[1]).toHaveAccessibleName('Home');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveTextContent('Home');
    expect(screen.getByRole('link', { name: 'For You' }).querySelector('svg')).not.toBeInTheDocument();
  });

  it('renders the entire configured bar as a horizontal scroller', () => {
    const preferences = customize({ layout: 'scrollable' });
    preferences.items = preferences.items.map((item) => ({ ...item, visible: true }));

    renderTabBar('/app/settings', preferences);

    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(navigation.querySelector('[data-layout="scrollable"]')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Friends' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
  });

  it('replaces the bar with an app launcher in Grid mode', async () => {
    const user = userEvent.setup();
    renderTabBar('/app', customize({ layout: 'grid' }));

    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Navigate' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Friends' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Customize navigation' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Menu' })).not.toBeInTheDocument();
  });
});
