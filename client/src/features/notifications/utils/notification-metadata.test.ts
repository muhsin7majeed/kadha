import { describe, expect, it } from 'vitest';

import { parseCollectionInviteMetadata, parseSystemNotificationMetadata } from './notification-metadata';

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

describe('parseSystemNotificationMetadata', () => {
  it('reads surviving collection names and aggregate counts', () => {
    expect(parseSystemNotificationMetadata('{"collectionName":"Weekend Watchlist","count":3}')).toEqual({
      collectionName: 'Weekend Watchlist',
      count: 3,
    });
  });

  it('falls back safely for malformed or future metadata', () => {
    expect(parseSystemNotificationMetadata('invalid')).toEqual({ count: 1 });
    expect(parseSystemNotificationMetadata('{"count":"many","extra":true}')).toEqual({ count: 1 });
  });
});
