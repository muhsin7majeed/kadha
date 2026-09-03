import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RecommendationFeedbackPayload, RecommendationItem } from '@/features/recommendations/recommendations.types';
import { renderWithProviders } from '@/test/render';

import RecommendationListItem from './recommendation-list-item';

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
}));

type MutationOptions = {
  onSuccess?: () => void;
  onError?: () => void;
  onSettled?: () => void;
};

vi.mock('@/components/media-card', () => ({
  default: () => <div>Media card</div>,
}));

vi.mock('@/features/recommendations/api/use-save-recommendation-feedback', () => ({
  default: () => ({ mutate: mocks.mutate, isPending: false }),
}));

const item: RecommendationItem = {
  media: {
    media_id: 123,
    media_type: 'movie',
    title: 'A Better Match',
    original_title: 'A Better Match',
    overview: 'A recommendation overview.',
    poster_path: null,
    backdrop_path: null,
    vote_average: 8,
    vote_count: 120,
    popularity: 24,
    adult: false,
    genre_ids: [18],
    release_date: '2026-01-01',
    original_language: 'en',
  },
  score: 8.5,
  reasons: [{ type: 'genre', label: 'Matches your Drama taste', score: 4.25 }],
};

describe('RecommendationListItem', () => {
  beforeEach(() => {
    mocks.mutate.mockReset();
  });

  it('loads only the clicked feedback button, keeps labels stable, and allows switching feedback', async () => {
    const user = userEvent.setup();
    const mutationOptions: MutationOptions[] = [];
    mocks.mutate.mockImplementation((_: RecommendationFeedbackPayload, options: MutationOptions) => {
      mutationOptions.push(options);
    });

    renderWithProviders(<RecommendationListItem item={item} />);

    await user.click(screen.getByRole('button', { name: 'More like this' }));

    expect(mocks.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ media_id: 123, media_type: 'movie', type: 'MORE_LIKE_THIS' }),
      expect.any(Object),
    );
    expect(screen.getByRole('button', { name: 'More like this' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Less like this' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Hide' })).toBeDisabled();

    act(() => {
      mutationOptions[0].onSuccess?.();
      mutationOptions[0].onSettled?.();
    });

    await waitFor(() => expect(screen.getByRole('button', { name: 'More like this' })).toBeDisabled());
    expect(screen.queryByRole('button', { name: 'More like this saved' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More like this' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Less like this' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Hide' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Less like this' }));

    act(() => {
      mutationOptions[1].onSuccess?.();
      mutationOptions[1].onSettled?.();
    });

    await waitFor(() => expect(screen.getByRole('button', { name: 'Less like this' })).toHaveAttribute('aria-pressed', 'true'));
    expect(screen.getByRole('button', { name: 'More like this' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'More like this' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('removes hidden recommendations optimistically and restores them if saving fails', async () => {
    const user = userEvent.setup();
    let mutationOptions: MutationOptions | undefined;
    mocks.mutate.mockImplementation((_: RecommendationFeedbackPayload, options: MutationOptions) => {
      mutationOptions = options;
    });

    renderWithProviders(<RecommendationListItem item={item} />);

    await user.click(screen.getByRole('button', { name: 'Hide' }));

    expect(screen.queryByRole('heading', { name: 'A Better Match' })).not.toBeInTheDocument();

    act(() => {
      mutationOptions?.onError?.();
      mutationOptions?.onSettled?.();
    });

    await waitFor(() => expect(screen.getByRole('heading', { name: 'A Better Match' })).toBeInTheDocument());
  });
});
