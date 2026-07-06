import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Provider } from '@/components/ui/provider';
import SearchInput from './search-input';

describe('SearchInput', () => {
  it('debounces search changes and clears the current query', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(
      <Provider>
        <SearchInput debounceMs={0} onSearchChange={onSearchChange} placeholder="Find media" />
      </Provider>,
    );

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
