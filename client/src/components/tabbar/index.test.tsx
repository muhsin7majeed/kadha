import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';

import TabBar from '.';

const renderTabBar = (path = '/app') =>
  renderWithProviders(
    <MemoryRouter initialEntries={[path]}>
      <TabBar />
    </MemoryRouter>,
  );

describe('TabBar', () => {
  it('shows the primary destinations and marks the current route', () => {
    renderTabBar('/app/watchlist');

    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Watchlist' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Progress' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Collections' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More navigation options' })).toBeInTheDocument();
  });

  it('reveals the remaining destinations from the More menu', async () => {
    const user = userEvent.setup();
    renderTabBar();

    await user.click(screen.getByRole('button', { name: 'More navigation options' }));

    expect(screen.getByRole('menuitem', { name: 'Activity' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Watched' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Liked' })).toBeInTheDocument();
  });
});
