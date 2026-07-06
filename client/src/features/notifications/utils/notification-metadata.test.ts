import { describe, expect, it } from 'vitest';

import { parseCollectionInviteMetadata } from './notification-metadata';

describe('parseCollectionInviteMetadata', () => {
  it('returns empty metadata for missing or invalid JSON input', () => {
    expect(parseCollectionInviteMetadata(null)).toEqual({});
    expect(parseCollectionInviteMetadata('not-json')).toEqual({});
    expect(parseCollectionInviteMetadata('"string"')).toEqual({});
  });

  it('parses supported collection invite metadata fields', () => {
    expect(parseCollectionInviteMetadata(JSON.stringify({ collectionName: 'Favorites', role: 'editor' }))).toEqual({
      collectionName: 'Favorites',
      role: 'editor',
    });
  });

  it('filters unsupported field types and roles', () => {
    expect(parseCollectionInviteMetadata(JSON.stringify({ collectionName: 123, role: 'owner' }))).toEqual({
      collectionName: undefined,
      role: undefined,
    });
  });
});
