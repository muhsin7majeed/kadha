import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import MediaTypeSegmentedControl from './index';

describe('MediaTypeSegmentedControl', () => {
  it('renders one accessible exclusive media-type selection', () => {
    renderWithProviders(
      <MediaTypeSegmentedControl
        aria-label="Filter by media type"
        value="movie"
        onValueChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('radiogroup', { name: 'Filter by media type' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'All' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Movies' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'TV' })).not.toBeChecked();
  });

  it('reports controlled changes and respects the disabled state', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = renderWithProviders(
      <MediaTypeSegmentedControl
        aria-label="Filter by media type"
        value="all"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByText('TV'));
    expect(onValueChange).toHaveBeenCalledWith('tv');

    rerender(
      <MediaTypeSegmentedControl
        aria-label="Filter by media type"
        disabled
        value="all"
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole('radio', { name: 'All' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Movies' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'TV' })).toBeDisabled();
  });

  it('uses the active palette for the visible selected state', () => {
    const { container } = renderWithProviders(
      <MediaTypeSegmentedControl
        aria-label="Filter by media type"
        value="movie"
        onValueChange={vi.fn()}
      />,
    );

    const root = screen.getByRole('radiogroup', { name: 'Filter by media type' });
    const indicator = container.querySelector('[data-part="indicator"]');
    const selectedItem = screen.getByRole('radio', { name: 'Movies' }).parentElement;

    expect(indicator).not.toBeNull();
    expect(getComputedStyle(root).getPropertyValue('--segment-indicator-bg')).toBe(
      'var(--chakra-colors-color-palette-solid)',
    );
    expect(getComputedStyle(selectedItem!).getPropertyValue('--bg-currentcolor')).toBe(
      'var(--chakra-colors-color-palette-solid)',
    );
    expect(getComputedStyle(selectedItem!).color).toBe(
      'var(--chakra-colors-color-palette-contrast)',
    );
  });
});
