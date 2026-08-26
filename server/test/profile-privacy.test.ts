import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { registerTestUser } from './helpers/auth';
import { createAcceptedFriendship } from './helpers/friendship';
import { getUserProfile, updateUserPrivacy } from './helpers/user';
import { getUserMediaListByUsername, updateUserMediaFlag } from './helpers/user-media';
import { getTestApp } from './helpers/app';

describe('profile privacy routes', () => {
  it('lets owners view their own private profile and media', async () => {
    const owner = await registerTestUser('private-owner');
    const mediaId = 882101;

    await updateUserPrivacy(owner, {
      profilePrivacy: 'ONLY_ME',
      watchedPrivacy: 'ONLY_ME',
      likedPrivacy: 'ONLY_ME',
      watchlistPrivacy: 'ONLY_ME',
    });
    await updateUserMediaFlag(owner, 'watched', true, mediaId);

    const profile = await getUserProfile(owner, owner.username);

    expect(profile).toMatchObject({
      username: owner.username,
      profilePrivacy: 'ONLY_ME',
      access: { canView: true },
      sections: {
        watched: true,
        liked: true,
        watchlist: true,
        collections: true,
      },
    });

    const watched = await getUserMediaListByUsername(owner, owner.username, 'watched');

    expect(watched.access).toEqual({ canView: true });
    expect(watched.pagination.total).toBe(1);
    expect(watched.data[0]).toMatchObject({ media_id: mediaId, watched: true });
  });

  it('returns private locked profile and media responses for non-friends', async () => {
    const owner = await registerTestUser('only-me-owner');
    const viewer = await registerTestUser('only-me-viewer');
    const mediaId = 882201;

    await updateUserPrivacy(owner, {
      profilePrivacy: 'ONLY_ME',
      watchlistPrivacy: 'ONLY_ME',
    });
    await updateUserMediaFlag(owner, 'watchlist', true, mediaId);

    const profile = await getUserProfile(viewer, owner.username);

    expect(profile.access).toEqual({
      canView: false,
      lockedReason: 'PRIVATE',
    });
    expect(profile.sections.watchlist).toBe(false);

    const watchlist = await getUserMediaListByUsername(viewer, owner.username, 'watchlist');

    expect(watchlist).toMatchObject({
      data: [],
      access: {
        canView: false,
        lockedReason: 'PRIVATE',
      },
    });
    expect(watchlist.pagination).toBeUndefined();
  });

  it('returns friends-only locked profile and media responses for non-friends', async () => {
    const owner = await registerTestUser('friends-owner');
    const viewer = await registerTestUser('friends-viewer');
    const mediaId = 882301;

    await updateUserPrivacy(owner, {
      profilePrivacy: 'FRIENDS',
      watchedPrivacy: 'FRIENDS',
    });
    await updateUserMediaFlag(owner, 'watched', true, mediaId);

    const profile = await getUserProfile(viewer, owner.username);

    expect(profile.access).toEqual({
      canView: false,
      lockedReason: 'FRIENDS_ONLY',
    });
    expect(profile.sections.watched).toBe(false);

    const watched = await getUserMediaListByUsername(viewer, owner.username, 'watched');

    expect(watched).toMatchObject({
      data: [],
      access: {
        canView: false,
        lockedReason: 'FRIENDS_ONLY',
      },
    });
    expect(watched.pagination).toBeUndefined();
  });

  it('lets accepted friends view friends-only profile media', async () => {
    const owner = await registerTestUser('accepted-owner');
    const friend = await registerTestUser('accepted-friend');
    const mediaId = 882401;

    await updateUserPrivacy(owner, {
      profilePrivacy: 'FRIENDS',
      watchedPrivacy: 'FRIENDS',
    });
    await updateUserMediaFlag(owner, 'watched', true, mediaId);
    await createAcceptedFriendship(friend, owner);

    const profile = await getUserProfile(friend, owner.username);

    expect(profile).toMatchObject({
      access: { canView: true },
      friendshipStatus: 'ACCEPTED',
      sections: {
        watched: true,
      },
    });

    const watched = await getUserMediaListByUsername(friend, owner.username, 'watched');

    expect(watched.access).toEqual({ canView: true });
    expect(watched.pagination.total).toBe(1);
    expect(watched.data[0]).toMatchObject({
      media_id: mediaId,
      watched: true,
    });
  });

  it('lets signed-in Kadha users view Kadha-users-visible profile and media', async () => {
    const owner = await registerTestUser('everyone-owner');
    const viewer = await registerTestUser('everyone-viewer');
    const mediaId = 882501;

    await updateUserPrivacy(owner, {
      profilePrivacy: 'KADHA_USERS',
      likedPrivacy: 'KADHA_USERS',
    });
    await updateUserMediaFlag(owner, 'liked', true, mediaId);

    const profile = await getUserProfile(viewer, owner.username);

    expect(profile).toMatchObject({
      access: { canView: true },
      sections: {
        liked: true,
      },
    });

    const liked = await getUserMediaListByUsername(viewer, owner.username, 'liked');

    expect(liked.access).toEqual({ canView: true });
    expect(liked.pagination.total).toBe(1);
    expect(liked.data[0]).toMatchObject({
      media_id: mediaId,
      liked: true,
    });
  });

  it('requires anonymous viewers to sign in for Kadha-users-visible media', async () => {
    const owner = await registerTestUser('kadha-users-public-owner');

    await updateUserPrivacy(owner, {
      profilePrivacy: 'KADHA_USERS',
      likedPrivacy: 'KADHA_USERS',
    });

    const profile = await request(await getTestApp()).get(`/api/public/users/${owner.username}/profile`).expect(200);

    expect(profile.body.access).toEqual({
      canView: false,
      lockedReason: 'SIGN_IN_REQUIRED',
    });

    const liked = await request(await getTestApp()).get(`/api/public/users/${owner.username}/liked`).expect(200);

    expect(liked.body).toMatchObject({
      data: [],
      access: {
        canView: false,
        lockedReason: 'SIGN_IN_REQUIRED',
      },
    });
  });

  it('lets anonymous viewers read public profile media', async () => {
    const owner = await registerTestUser('web-public-owner');
    const mediaId = 882601;

    await updateUserPrivacy(owner, {
      profilePrivacy: 'PUBLIC',
      likedPrivacy: 'PUBLIC',
    });
    await updateUserMediaFlag(owner, 'liked', true, mediaId);

    const profile = await request(await getTestApp()).get(`/api/public/users/${owner.username}/profile`).expect(200);

    expect(profile.body).toMatchObject({
      access: { canView: true },
      sections: {
        liked: true,
      },
    });

    const liked = await request(await getTestApp()).get(`/api/public/users/${owner.username}/liked`).expect(200);

    expect(liked.body.access).toEqual({ canView: true });
    expect(liked.body.pagination.total).toBe(1);
    expect(liked.body.data[0]).toMatchObject({
      media_id: mediaId,
      liked: true,
    });
  });
});
