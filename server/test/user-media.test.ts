import { describe, expect, it } from 'vitest';

import { registerTestUser } from './helpers/auth';
import { getCurrentUserMediaList, updateUserMediaFlag } from './helpers/user-media';

describe('user media routes', () => {
  it('adds and removes liked media for the current user', async () => {
    const user = await registerTestUser('liked-user');
    const mediaId = 881101;

    const likedResponse = await updateUserMediaFlag(user, 'liked', true, mediaId);

    expect(likedResponse.body).toEqual({ message: 'movie liked' });

    const likedList = await getCurrentUserMediaList(user, 'liked');

    expect(likedList.pagination.total).toBe(1);
    expect(likedList.data[0]).toMatchObject({
      media_id: mediaId,
      media_type: 'movie',
      title: `Test Movie ${mediaId}`,
      liked: true,
      watched: false,
      watchlist: false,
    });
    expect(likedList.data[0]?.likedAt).toEqual(expect.any(String));

    const unlikedResponse = await updateUserMediaFlag(user, 'liked', false, mediaId);

    expect(unlikedResponse.body).toEqual({ message: 'movie unliked' });

    const updatedLikedList = await getCurrentUserMediaList(user, 'liked');

    expect(updatedLikedList.pagination.total).toBe(0);
    expect(updatedLikedList.data).toEqual([]);
  });

  it('adds and removes watchlist media for the current user', async () => {
    const user = await registerTestUser('watchlist-user');
    const mediaId = 881201;

    const watchlistResponse = await updateUserMediaFlag(user, 'watchlist', true, mediaId);

    expect(watchlistResponse.body).toEqual({ message: 'movie added to watchlist' });

    const watchlist = await getCurrentUserMediaList(user, 'watchlist');

    expect(watchlist.pagination.total).toBe(1);
    expect(watchlist.data[0]).toMatchObject({
      media_id: mediaId,
      watchlist: true,
      watched: false,
      liked: false,
    });
    expect(watchlist.data[0]?.watchlistAt).toEqual(expect.any(String));

    const removedResponse = await updateUserMediaFlag(user, 'watchlist', false, mediaId);

    expect(removedResponse.body).toEqual({ message: 'movie removed from watchlist' });

    const updatedWatchlist = await getCurrentUserMediaList(user, 'watchlist');

    expect(updatedWatchlist.pagination.total).toBe(0);
    expect(updatedWatchlist.data).toEqual([]);
  });

  it('marks media watched and removes it from the watchlist', async () => {
    const user = await registerTestUser('watched-user');
    const mediaId = 881301;

    await updateUserMediaFlag(user, 'watchlist', true, mediaId);

    const watchedResponse = await updateUserMediaFlag(user, 'watched', true, mediaId);

    expect(watchedResponse.body).toEqual({ message: 'movie watched' });

    const watchedList = await getCurrentUserMediaList(user, 'watched');

    expect(watchedList.pagination.total).toBe(1);
    expect(watchedList.data[0]).toMatchObject({
      media_id: mediaId,
      watched: true,
      watchlist: false,
    });
    expect(watchedList.data[0]?.watchedAt).toEqual(expect.any(String));

    const watchlist = await getCurrentUserMediaList(user, 'watchlist');

    expect(watchlist.pagination.total).toBe(0);
    expect(watchlist.data).toEqual([]);
  });

  it('keeps media state isolated between users', async () => {
    const firstUser = await registerTestUser('media-first-user');
    const secondUser = await registerTestUser('media-second-user');
    const mediaId = 881401;

    await updateUserMediaFlag(firstUser, 'liked', true, mediaId);

    const firstUserLiked = await getCurrentUserMediaList(firstUser, 'liked');
    const secondUserLiked = await getCurrentUserMediaList(secondUser, 'liked');

    expect(firstUserLiked.pagination.total).toBe(1);
    expect(firstUserLiked.data[0]).toMatchObject({ media_id: mediaId, liked: true });
    expect(secondUserLiked.pagination.total).toBe(0);
    expect(secondUserLiked.data).toEqual([]);
  });
});
