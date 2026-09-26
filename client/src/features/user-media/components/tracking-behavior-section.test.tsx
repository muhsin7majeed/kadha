import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import type { TrackingPreferences } from '../user-media.types';
import TrackingBehaviorSection from './tracking-behavior-section';

const mocks = vi.hoisted(() => ({
  data: { version: 1, keepWatchedOnWatchlist: false, hideCaughtUpWithoutScheduledNext: false } as TrackingPreferences,
  isLoading: false,
  isError: false,
  isPending: false,
  save: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock('../api/use-tracking-preferences', () => ({
  default: () => ({ data: mocks.data, isLoading: mocks.isLoading, isError: mocks.isError, refetch: mocks.refetch }),
}));
vi.mock('../api/use-update-tracking-preferences', () => ({
  default: () => ({ mutate: mocks.save, isPending: mocks.isPending }),
}));

beforeEach(() => {
  mocks.data = { version: 1, keepWatchedOnWatchlist: false, hideCaughtUpWithoutScheduledNext: false };
  mocks.isLoading = false;
  mocks.isError = false;
  mocks.isPending = false;
  mocks.save.mockReset();
  mocks.refetch.mockReset();
  mocks.save.mockImplementation(async (value: TrackingPreferences) => value);
});

describe('TrackingBehaviorSection', () => {
  it('leaves both account choices off by default and saves them together', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TrackingBehaviorSection />);
    const keep = screen.getByRole('checkbox', { name: 'Keep watched titles on my Watchlist' });
    const hide = screen.getByRole('checkbox', { name: 'Hide caught-up shows with nothing scheduled' });
    expect(keep).not.toBeChecked();
    expect(hide).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Save tracking behavior' })).toBeDisabled();
    await user.click(keep);
    await user.click(hide);
    await user.click(screen.getByRole('button', { name: 'Save tracking behavior' }));
    expect(mocks.save).toHaveBeenCalledWith({ version: 1, keepWatchedOnWatchlist: true, hideCaughtUpWithoutScheduledNext: true });
  });

  it('keeps an edited choice available to retry after a failed save', async () => {
    mocks.save.mockImplementationOnce(() => undefined);
    const user = userEvent.setup();
    renderWithProviders(<TrackingBehaviorSection />);
    await user.click(screen.getByRole('checkbox', { name: 'Keep watched titles on my Watchlist' }));
    await user.click(screen.getByRole('button', { name: 'Save tracking behavior' }));
    expect(screen.getByRole('checkbox', { name: 'Keep watched titles on my Watchlist' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Save tracking behavior' })).toBeEnabled();
  });

  it('shows saved choices and does not offer writable defaults during loading or failure', async () => {
    mocks.isLoading = true;
    const view = renderWithProviders(<TrackingBehaviorSection />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    view.unmount();
    mocks.isLoading = false;
    mocks.isError = true;
    renderWithProviders(<TrackingBehaviorSection />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));
    expect(mocks.refetch).toHaveBeenCalled();
  });
});
