import { describe, expect, it } from 'vitest';

import type { TvProgressResponse } from '../user-media.types';
import { getNextEpisodeLabel, getTvProgressPrimaryActionLabel } from './tv-progress';

const createProgress = (overrides: Partial<TvProgressResponse>): TvProgressResponse => ({
  status: 'not_started',
  watchedEpisodeCount: 0,
  totalAiredEpisodeCount: 0,
  nextEpisode: null,
  seasons: [],
  ...overrides,
});

describe('tv progress utils', () => {
  it('returns primary TV action labels from progress state', () => {
    expect(getTvProgressPrimaryActionLabel()).toBe('Track progress');
    expect(getTvProgressPrimaryActionLabel(createProgress({ status: 'not_started' }))).toBe('Track progress');
    expect(
      getTvProgressPrimaryActionLabel(
        createProgress({
          status: 'in_progress',
          watchedEpisodeCount: 1,
          nextEpisode: {
            airDate: '2026-01-01',
            episodeId: 10,
            episodeNumber: 2,
            name: 'Next',
            seasonNumber: 1,
          },
        }),
      ),
    ).toBe('Mark next episode');
    expect(getTvProgressPrimaryActionLabel(createProgress({ status: 'caught_up', watchedEpisodeCount: 4 }))).toBe(
      'Caught up',
    );
    expect(getTvProgressPrimaryActionLabel(createProgress({ status: 'completed', watchedEpisodeCount: 4 }))).toBe(
      'Completed',
    );
  });

  it('formats next episode labels', () => {
    expect(getNextEpisodeLabel(createProgress({ nextEpisode: null }))).toBeNull();
    expect(
      getNextEpisodeLabel(
        createProgress({
          nextEpisode: {
            airDate: null,
            episodeId: null,
            episodeNumber: 4,
            name: 'Episode 4',
            seasonNumber: 2,
          },
        }),
      ),
    ).toBe('S2 E4');
  });
});
