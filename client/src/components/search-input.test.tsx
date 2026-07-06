import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import SearchInput from './search-input';

describe('SearchInput', () => {
  it('debounces search changes and clears the current query', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    renderWithProviders(<SearchInput debounceMs={0} onSearchChange={onSearchChange} placeholder="Find media" />);

    await user.type(screen.getByRole('textbox', { name: 'Find media' }), 'dune');

    await waitFor(() => {
      expect(onSearchChange).toHaveBeenLastCalledWith('dune');
    });

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    await waitFor(() => {
      expect(onSearchChange).toHaveBeenLastCalledWith('');
    });
  });
});
