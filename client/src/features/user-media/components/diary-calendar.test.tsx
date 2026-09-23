import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const renderCalendar = (
  overrides: Partial<React.ComponentProps<typeof DiaryCalendar>> = {},
) => {
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
  it('renders leap-day activity with exact accessible counts', async () => {
    const props = renderCalendar({
      daily: [
        ...daily,
        {
          date: '2024-03-01',
          movieWatches: 4,
          episodeWatches: 0,
          totalEntries: 4,
          estimatedMinutes: 420,
        },
      ],
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /February 29, 2024, 3 watches, 1 movie, 2 episodes/,
      }),
    );

    await waitFor(() =>
      expect(props.onSelectDate).toHaveBeenCalledWith('2024-02-29'),
    );
    expect(screen.getByText('3 watches across 1 day')).toBeInTheDocument();
    expect(screen.getByText('1 movie')).toBeInTheDocument();
    expect(screen.getByText('2 episodes')).toBeInTheDocument();
  });

  it('moves focus between dates with calendar arrow keys and keeps one date in the tab order', async () => {
    const user = userEvent.setup();
    renderCalendar({ daily: [] });

    const firstDay = screen.getByRole('button', {
      name: /February 1, 2024, no watches/,
    });
    const secondDay = screen.getByRole('button', {
      name: /February 2, 2024, no watches/,
    });

    firstDay.focus();
    await user.keyboard('{ArrowRight}');

    await waitFor(() => expect(secondDay).toHaveFocus());
    const dateButtons = screen.getAllByRole('button', {
      name: /February \d{1,2}, 2024/,
    });
    expect(dateButtons.filter((button) => button.tabIndex === 0)).toHaveLength(
      1,
    );
  });

  it('navigates across year boundaries and explains undated exclusions', async () => {
    const props = renderCalendar({ year: 2024, month: 1, daily: [] });

    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));

    await waitFor(() =>
      expect(props.onPeriodChange).toHaveBeenCalledWith(2023, 12),
    );
    expect(
      screen.getByText(/Entries without a recorded date/),
    ).toBeInTheDocument();
  });

  it('distinguishes selected-day loading and failure from an empty day', async () => {
    const onDayRetry = vi.fn();
    renderCalendar({
      selectedDate: '2024-02-29',
      isDayLoading: true,
      onDayRetry,
    });

    expect(screen.getByLabelText('Loading selected day')).toBeInTheDocument();
    expect(screen.queryByText('No watches were logged for this day.')).not.toBeInTheDocument();

    cleanup();
    renderCalendar({
      selectedDate: '2024-02-29',
      isDayError: true,
      onDayRetry,
    });

    expect(screen.getByText('Selected day unavailable')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onDayRetry).toHaveBeenCalledOnce();
    expect(screen.queryByText('No watches were logged for this day.')).not.toBeInTheDocument();
  });
});
