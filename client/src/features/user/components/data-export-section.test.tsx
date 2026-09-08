import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import DataExportSection from './data-export-section';

const mocks = vi.hoisted(() => ({
  exportUserData: vi.fn(),
}));

vi.mock('@/features/user/api/use-export-user-data', () => ({
  default: () => ({ mutate: mocks.exportUserData, isPending: false }),
}));

describe('DataExportSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('selects every category by default and exports the current selection', async () => {
    const user = userEvent.setup();
    const patchedFocus = HTMLElement.prototype.focus;
    Object.defineProperty(HTMLElement.prototype, 'focus', {
      configurable: true,
      writable: true,
      value: patchedFocus,
    });
    renderWithProviders(<DataExportSection />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(9);
    checkboxes.forEach((checkbox) => expect(checkbox).toBeChecked());

    await user.click(screen.getByRole('checkbox', { name: /Account profile and preferences/ }));
    await user.click(screen.getByRole('button', { name: 'Export selected data' }));

    expect(mocks.exportUserData).toHaveBeenCalledWith(expect.not.arrayContaining(['accountPreferences']));
    expect(mocks.exportUserData).toHaveBeenCalledWith(expect.arrayContaining(['mediaTracking', 'activity']));
  });

  it('requires at least one selected category', () => {
    renderWithProviders(<DataExportSection />);

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(screen.getByRole('button', { name: 'Export selected data' })).toBeDisabled();
    expect(screen.getByText('Select at least one category.')).toBeInTheDocument();
  });
});
