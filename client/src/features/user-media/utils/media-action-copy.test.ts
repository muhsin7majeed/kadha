import { describe, expect, it } from 'vitest';

import type { UserMediaPayload } from '../user-media.types';
import {
  getMediaActionLabel,
  getMediaActionStateLabel,
  getMediaActionToast,
  getUndoMediaActionPayload,
} from './media-action-copy';

const payload: UserMediaPayload = {
  adult: false,
  backdrop_path: '/backdrop.jpg',
  genre_ids: [18],
  liked: false,
  media_id: 1,
  media_type: 'movie',
  original_language: 'en',
  original_title: 'Original Title',
  overview: 'Overview',
  popularity: 10,
  poster_path: '/poster.jpg',
  release_date: '2025-01-01',
  runtime: 120,
  status: 'Released',
  title: 'Example Movie',
  vote_average: 8,
  vote_count: 100,
  watched: false,
  watchlist: false,
};

describe('media action copy', () => {
  it('returns action and state labels for active and inactive states', () => {
    expect(getMediaActionLabel('liked', false)).toBe('Like');
    expect(getMediaActionLabel('liked', true)).toBe('Unlike');
    expect(getMediaActionStateLabel('watchlist', false)).toBe('Watchlist');
    expect(getMediaActionStateLabel('watchlist', true)).toBe('In watchlist');
  });

  it('returns watched toast copy with the watchlist cleanup description', () => {
    expect(getMediaActionToast('watched', { ...payload, watched: true })).toEqual({
      title: 'Marked Example Movie watched',
      description: 'Removed from watchlist too.',
    });

    expect(getMediaActionToast('watched', { ...payload, watched: false })).toEqual({
      title: 'Marked Example Movie unwatched',
      description: undefined,
    });
  });

  it('falls back to a media type label when the payload has no title', () => {
    expect(getMediaActionToast('watchlist', { ...payload, media_type: 'tv', title: '', watchlist: true })).toEqual({
      title: 'Added This TV show to watchlist',
    });
  });

  it('builds undo payloads without mutating the original payload', () => {
    const undoPayload = getUndoMediaActionPayload('liked', payload);

    expect(undoPayload).not.toBe(payload);
    expect(undoPayload.liked).toBe(true);
    expect(payload.liked).toBe(false);
  });
});
