import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import CalendarMonthGrid from '.';

const renderGrid = (overrides: Partial<React.ComponentProps<typeof CalendarMonthGrid>> = {}) => {
  const props: React.ComponentProps<typeof CalendarMonthGrid> = {
    getDayLabel: (date) => `${date} schedule`,
    hasContent: (date) => date === '2024-02-29',
    month: 2,
    onPeriodChange: vi.fn(),
    onSelectDate: vi.fn(),
    renderDayContent: (date) => (date === '2024-02-29' ? <span>3 releases</span> : null),
    summary: '3 releases this month',
    year: 2024,
    ...overrides,
  };

  renderWithProviders(<CalendarMonthGrid {...props} />);
  return props;
};

describe('CalendarMonthGrid', () => {
  it('renders locale-aware weekdays and custom day content', () => {
    renderGrid();

    expect(screen.getByText('3 releases this month')).toBeInTheDocument();
    expect(screen.getByText('3 releases')).toBeInTheDocument();
    expect(screen.getAllByText(/Monday|Sunday/).length).toBeGreaterThan(0);
  });

  it('selects dates and navigates across year boundaries', async () => {
    const props = renderGrid({ year: 2024, month: 1 });

    fireEvent.click(screen.getByRole('button', { name: '2024-01-01 schedule' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }));

    await waitFor(() => {
      expect(props.onSelectDate).toHaveBeenCalledWith('2024-01-01');
      expect(props.onPeriodChange).toHaveBeenCalledWith(2023, 12);
    });
  });

  it('uses arrow-key navigation with a single day in the tab order', async () => {
    const user = userEvent.setup();
    renderGrid();

    const firstDay = screen.getByRole('button', { name: '2024-02-01 schedule' });
    const secondDay = screen.getByRole('button', { name: '2024-02-02 schedule' });

    firstDay.focus();
    await user.keyboard('{ArrowRight}');

    await waitFor(() => expect(secondDay).toHaveFocus());
    const dateButtons = screen.getAllByRole('button', { name: /2024-02-\d{2} schedule/ });
    expect(dateButtons.filter((button) => button.tabIndex === 0)).toHaveLength(1);
  });
});
