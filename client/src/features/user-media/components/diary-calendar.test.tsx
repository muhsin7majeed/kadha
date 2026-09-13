import { fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import DiaryCalendar from './diary-calendar';

const daily = [
  {
    date: '2024-02-29',
    movieWatches: 1,
    episodeWatches: 2,
    totalEntries: 3,
    estimatedMinutes: 210,
    runtimeCoverage: { coveredEntries: 3, totalEntries: 3, ratio: 1 },
  },
];

const renderCalendar = (overrides: Partial<React.ComponentProps<typeof DiaryCalendar>> = {}) => {
  const props: React.ComponentProps<typeof DiaryCalendar> = {
    daily,
    isDayFetching: false,
    month: 2,
    onDayPageChange: vi.fn(),
    onPeriodChange: vi.fn(),
    onSelectDate: vi.fn(),
    year: 2024,
    ...overrides,
  };

  renderWithProviders(
    <MemoryRouter>
      <DiaryCalendar {...props} />
    </MemoryRouter>,
  );
  return props;
};

describe('DiaryCalendar', () => {
  it('renders leap-day activity with exact accessible counts', () => {
    const props = renderCalendar();

    fireEvent.click(
      screen.getByRole('button', {
        name: /February 29, 2024, 3 watches, 1 movie, 2 episodes/,
      }),
    );

    expect(props.onSelectDate).toHaveBeenCalledWith('2024-02-29');
    expect(screen.getByText('1M · 2E')).toBeInTheDocument();
  });

  it('navigates across year boundaries and explains undated exclusions', () => {
    const props = renderCalendar({ year: 2024, month: 1, daily: [] });

    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));

    expect(props.onPeriodChange).toHaveBeenCalledWith(2023, 12);
    expect(screen.getByText(/Entries without a recorded date/)).toBeInTheDocument();
  });
});
