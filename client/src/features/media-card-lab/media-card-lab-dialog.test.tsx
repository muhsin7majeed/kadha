import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';
import MediaCardLabDialog from './media-card-lab-dialog';

const openLab = async () => {
  const user = userEvent.setup();
  renderWithProviders(<MediaCardLabDialog />);
  await user.click(screen.getByRole('button', { name: 'Compare media cards' }));
  return user;
};

describe('MediaCardLabDialog', () => {
  it('compares all five named concepts with visible personal states', async () => {
    await openLab();

    const dialog = screen.getByRole('dialog', { name: 'Media card design lab' });
    expect(within(dialog).getByRole('heading', { name: '1. Quiet Poster' })).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: '2. Editorial Caption' })).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: '3. Split Decision Card' })).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: '4. Focus Reveal' })).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: '5. Compact Poster + Quick View' })).toBeInTheDocument();
    expect(within(dialog).getAllByText('Liked').length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText('Watchlist').length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText('Watched ×2').length).toBeGreaterThan(0);
  });

  it('provides labelled quick information and overflow actions', async () => {
    const user = await openLab();

    await user.click(screen.getAllByRole('button', { name: 'Quick info about Shōgun' })[0]);
    expect(await screen.findByRole('dialog', { name: 'Shōgun' })).toHaveTextContent(
      'Lord Yoshii Toranaga fights for his life',
    );

    await user.keyboard('{Escape}');
    await user.click(screen.getAllByRole('button', { name: 'Manage Dune: Part Two' })[0]);
    expect(screen.getByRole('menuitem', { name: 'Remove from liked' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Remove from watchlist' })).toBeInTheDocument();
  });

  it('closes the lab without navigating away from Home', async () => {
    const user = await openLab();

    const dialog = screen.getByRole('dialog', { name: 'Media card design lab' });
    const trigger = screen.getByRole('button', { name: 'Compare media cards', hidden: true });
    await user.click(within(dialog).getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    expect(trigger).toBeInTheDocument();
  });
});
