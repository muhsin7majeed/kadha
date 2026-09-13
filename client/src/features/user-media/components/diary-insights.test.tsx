import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import DiaryHeatmap from './diary-heatmap';
import DiaryTrends from './diary-trends';

const emptyCoverage = { coveredEntries: 0, totalEntries: 0, ratio: 0 };
const monthly = Array.from({ length: 12 }, (_, index) => ({
  month: index + 1,
  movieWatches: index === 0 ? 2 : 0,
  episodeWatches: index === 0 ? 3 : 0,
  totalEntries: index === 0 ? 5 : 0,
  estimatedMinutes: index === 0 ? 300 : 0,
  runtimeCoverage: index === 0 ? { coveredEntries: 5, totalEntries: 5, ratio: 1 } : emptyCoverage,
}));

describe('diary insight visualizations', () => {
  it('makes exact heatmap values keyboard-accessible and opens populated dates', () => {
    const onSelectDate = vi.fn();
    renderWithProviders(
      <DiaryHeatmap
        year={2026}
        daily={[
          {
            date: '2026-09-13',
            movieWatches: 1,
            episodeWatches: 2,
            totalEntries: 3,
            estimatedMinutes: 200,
            runtimeCoverage: { coveredEntries: 3, totalEntries: 3, ratio: 1 },
          },
        ]}
        onSelectDate={onSelectDate}
      />,
    );

    fireEvent.click(screen.getByRole('gridcell', { name: /September 13, 2026: 3 watches/ }));
    expect(onSelectDate).toHaveBeenCalledWith('2026-09-13');
    expect(screen.getByText(/Darker squares contain more diary entries—not a score to beat/)).toBeInTheDocument();
  });

  it('shows exact monthly volume and estimated-time values without chart interaction', () => {
    renderWithProviders(<DiaryTrends monthly={monthly} />);

    expect(screen.getByLabelText('Jan: 2 movies and 3 episodes')).toBeInTheDocument();
    expect(screen.getByLabelText('Jan: 5h estimated')).toBeInTheDocument();
    expect(screen.getByText(/Missing runtimes are excluded/)).toBeInTheDocument();
  });
});
