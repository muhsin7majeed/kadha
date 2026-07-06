import { describe, expect, it } from 'vitest';

import { parseActivityMetadata } from './activity-metadata';

describe('parseActivityMetadata', () => {
  it('returns empty metadata for missing or invalid JSON input', () => {
    expect(parseActivityMetadata(null)).toEqual({});
    expect(parseActivityMetadata('not-json')).toEqual({});
    expect(parseActivityMetadata('"string"')).toEqual({});
  });

  it('returns parsed metadata objects', () => {
    expect(
      parseActivityMetadata(
        JSON.stringify({
          collectionName: 'Watch Party',
          poster_path: '/poster.jpg',
          title: 'Example Movie',
        }),
      ),
    ).toEqual({
      collectionName: 'Watch Party',
      poster_path: '/poster.jpg',
      title: 'Example Movie',
    });
  });
});
