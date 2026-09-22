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
  it('scrolls the results target when changing pages without scrolling on mount', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const scrollIntoView = vi.fn();

    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    renderWithProviders(<PaginationHarness onPageChange={onPageChange} />);

    expect(scrollIntoView).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'auto' });
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
