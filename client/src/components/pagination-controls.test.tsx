import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PaginationMeta } from '@/types/common';
import { renderWithProviders } from '@/test/render';
import PaginationControls from './pagination-controls';

const pagination: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 60,
  totalPages: 3,
  hasNextPage: true,
  hasPreviousPage: false,
};

const PaginationHarness = ({ onPageChange }: { onPageChange: (page: number) => void }) => {
  const resultsRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={resultsRef}>Results</div>
      <PaginationControls pagination={pagination} onPageChange={onPageChange} scrollTargetRef={resultsRef} />
    </>
  );
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PaginationControls', () => {
  it('smoothly scrolls the results target below the sticky navigation when changing pages', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const scrollTo = vi.fn();
    const navigation = document.createElement('nav');

    Object.defineProperty(window, 'scrollTo', { configurable: true, value: scrollTo });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 100 });
    Object.defineProperty(navigation, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ height: 64 }),
    });
    document.body.appendChild(navigation);

    renderWithProviders(<PaginationHarness onPageChange={onPageChange} />);
    Object.defineProperty(screen.getByText('Results'), 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ top: 600 }),
    });

    expect(scrollTo).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 628, behavior: 'smooth' });
    expect(onPageChange).toHaveBeenCalledWith(2);

    navigation.remove();
  });
});
