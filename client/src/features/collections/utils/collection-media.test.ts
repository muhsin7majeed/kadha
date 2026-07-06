import { describe, expect, it } from 'vitest';

import type { CollectionMedia } from '@/features/collections/collections.types';

import { collectionMediaToMediaCardModel, parseCollectionGenreIds } from './collection-media';

const collectionMedia: CollectionMedia = {
  adult: false,
  backdrop_path: '/backdrop.jpg',
  collectionId: 'collection-1',
  created_at: new Date('2025-01-01T00:00:00.000Z'),
  genre_ids: '[18, "bad", 878]',
  liked: true,
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
  watchlist: true,
};

describe('collection media utilities', () => {
  it('parses collection genre ids from arrays and JSON strings', () => {
    expect(parseCollectionGenreIds([18, 878])).toEqual([18, 878]);
    expect(parseCollectionGenreIds('[18, "bad", 878]')).toEqual([18, 878]);
  });

  it('returns an empty genre list for missing or invalid genre ids', () => {
    expect(parseCollectionGenreIds(null)).toEqual([]);
    expect(parseCollectionGenreIds(undefined)).toEqual([]);
    expect(parseCollectionGenreIds('not-json')).toEqual([]);
  });

  it('converts collection media into media card models', () => {
    expect(collectionMediaToMediaCardModel(collectionMedia)).toMatchObject({
      genre_ids: [18, 878],
      liked: true,
      media_id: 1,
      title: 'Example Movie',
      watched: false,
      watchlist: true,
    });
  });
});
