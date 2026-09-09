import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';
import { addMovieToCollection, createTestCollection, inviteUserToCollection } from './helpers/collection';
import { updateUserMediaFlag } from './helpers/user-media';

describe('user data import', () => {
  it('accepts import previews larger than the default Express JSON limit', async () => {
    const target = await registerTestUser('large-import-target');
    const response = await request(await getTestApp())
      .post('/api/user/import/preview')
      .set('Authorization', authorization(target))
      .send({
        export: {
          schemaVersion: 1,
          account: { username: 'large-source' },
          activity: [{ metadata: 'x'.repeat(150_000) }],
        },
      })
      .expect(200);

    expect(response.body.data.source.username).toBe('large-source');
    expect(response.body.data.unsupported.activity).toBe(1);
  });

  it('returns a structured error when an import exceeds 10 MB', async () => {
    const target = await registerTestUser('oversized-import-target');
    const response = await request(await getTestApp())
      .post('/api/user/import/preview')
      .set('Authorization', authorization(target))
      .send({
        export: { activity: [{ metadata: 'x'.repeat(11 * 1024 * 1024) }] },
      })
      .expect(413);

    expect(response.body).toEqual({
      message: 'This export is larger than the 10 MB import limit.',
      code: 'IMPORT_FILE_TOO_LARGE',
    });
  });

  it('rejects unsupported and malformed versioned exports', async () => {
    const target = await registerTestUser('invalid-import-target');
    const app = await getTestApp();

    await request(app)
      .post('/api/user/import/preview')
      .set('Authorization', authorization(target))
      .send({ export: { schemaVersion: 99 } })
      .expect(400);

    await request(app)
      .post('/api/user/import/preview')
      .set('Authorization', authorization(target))
      .send({ export: { schemaVersion: 2, format: 'not-kadha', data: {} } })
      .expect(400);
  });

  it('previews a Kadha export without writing records', async () => {
    const source = await registerTestUser('import-preview-source');
    const target = await registerTestUser('import-preview-target');

    await updateUserMediaFlag(source, 'liked', true, 886101, {
      rating: 9,
      likedNote: 'Worth bringing over',
    });
    await prisma.watchEvent.create({
      data: {
        userId: source.userId,
        media_id: 886102,
        media_type: 'movie',
        note: 'Previewed rewatch',
      },
    });
    await createTestCollection(source, 'Preview collection');

    const exportResponse = await request(await getTestApp())
      .get('/api/user/export')
      .set('Authorization', authorization(source))
      .expect(200);

    const previewResponse = await request(await getTestApp())
      .post('/api/user/import/preview')
      .set('Authorization', authorization(target))
      .send({ export: exportResponse.body })
      .expect(200);

    expect(previewResponse.body.data).toMatchObject({
      source: {
        username: source.username,
      },
      importable: {
        media: 1,
        watchEvents: 1,
        collections: 1,
        collectionItems: 0,
      },
      unsupported: {
        friendships: 0,
        notifications: expect.any(Number),
        collectionMemberships: 0,
        collectionInvites: 0,
        activity: expect.any(Number),
      },
    });
    expect(await prisma.userMedia.count({ where: { userId: target.userId } })).toBe(0);
    expect(await prisma.watchEvent.count({ where: { userId: target.userId } })).toBe(0);
    expect(await prisma.collection.count({ where: { userId: target.userId } })).toBe(0);
  });

  it('keeps schema-v1 exports importable', async () => {
    const target = await registerTestUser('legacy-import-target');
    const legacyExport = {
      schemaVersion: 1,
      account: {
        id: 'legacy-source-id',
        username: 'legacy-source',
        profilePrivacy: 'PUBLIC',
        watchedPrivacy: 'ONLY_ME',
        likedPrivacy: 'FRIENDS',
        watchlistPrivacy: 'KADHA_USERS',
        watchRegion: 'CA',
      },
      media: [
        {
          id: 'legacy-user-media-id',
          userId: 'legacy-source-id',
          media_id: 886150,
          media_type: 'movie',
          liked: true,
          watched: false,
          watchlist: false,
          media: {
            media_id: 886150,
            media_type: 'movie',
            title: 'Legacy Movie',
          },
        },
      ],
      watchEvents: [],
      collections: [],
    };

    await request(await getTestApp())
      .post('/api/user/import')
      .set('Authorization', authorization(target))
      .send({
        export: legacyExport,
        options: { categories: ['accountPreferences', 'mediaTracking'] },
      })
      .expect(200);

    expect(await prisma.user.findUniqueOrThrow({ where: { id: target.userId } })).toMatchObject({
      username: target.username,
      profilePrivacy: 'PUBLIC',
      likedPrivacy: 'FRIENDS',
      watchlistPrivacy: 'KADHA_USERS',
      watchRegion: 'CA',
    });
    expect(
      await prisma.userMedia.findUniqueOrThrow({
        where: {
          userId_media_id_media_type: {
            userId: target.userId,
            media_id: 886150,
            media_type: 'movie',
          },
        },
      }),
    ).toMatchObject({ liked: true });
  });

  it('imports media snapshot dependencies with watch history', async () => {
    const target = await registerTestUser('watch-dependency-import-target');
    const exportData = {
      format: 'kadha-data-export',
      schemaVersion: 2,
      data: {
        mediaSnapshots: [
          {
            media_id: 886160,
            media_type: 'movie',
            title: 'Portable Watch Event',
          },
        ],
        watchEvents: [
          {
            eventId: 'portable-watch-event-id',
            media_id: 886160,
            media_type: 'movie',
            watchedAt: '2026-09-05T00:00:00.000Z',
          },
        ],
      },
    };

    await request(await getTestApp())
      .post('/api/user/import')
      .set('Authorization', authorization(target))
      .send({ export: exportData, options: { categories: ['watchHistory'] } })
      .expect(200);

    expect(
      await prisma.mediaSnapshot.findUniqueOrThrow({
        where: {
          media_id_media_type: { media_id: 886160, media_type: 'movie' },
        },
      }),
    ).toMatchObject({ title: 'Portable Watch Event' });
    expect(
      await prisma.watchEvent.count({
        where: { userId: target.userId, media_id: 886160 },
      }),
    ).toBe(1);
  });

  it('imports another user export into the current account without importing social state', async () => {
    const source = await registerTestUser('import-source');
    const target = await registerTestUser('import-target');
    const thirdUser = await registerTestUser('import-third-user');

    await updateUserMediaFlag(source, 'liked', true, 886201, {
      rating: 8,
      likedNote: 'Imported liked note',
    });
    await updateUserMediaFlag(source, 'watchlist', true, 886202, {
      watchlistNote: 'Imported watchlist note',
    });
    await prisma.watchEvent.create({
      data: {
        userId: source.userId,
        media_id: 886203,
        media_type: 'tv',
        seasonNumber: 1,
        episodeNumber: 3,
        episodeId: 1003,
        note: 'Imported episode note',
      },
    });
    const collection = await createTestCollection(source, 'Imported collection');
    await addMovieToCollection(source, collection.id, 886204);
    await inviteUserToCollection(source, collection.id, thirdUser, 'viewer');
    await request(await getTestApp())
      .post('/api/friendship/send-friend-request')
      .set('Authorization', authorization(source))
      .send({ receiverId: thirdUser.userId })
      .expect(201);
    await prisma.recommendationSettings.create({
      data: {
        userId: source.userId,
        useWatchlist: true,
      },
    });
    await prisma.recommendationFeedback.create({
      data: {
        userId: source.userId,
        media_id: 886201,
        media_type: 'movie',
        type: 'MORE_LIKE_THIS',
      },
    });

    const exportResponse = await request(await getTestApp())
      .get('/api/user/export')
      .set('Authorization', authorization(source))
      .expect(200);

    const importResponse = await request(await getTestApp())
      .post('/api/user/import')
      .set('Authorization', authorization(target))
      .send({ export: exportResponse.body })
      .expect(200);

    expect(importResponse.body.data).toMatchObject({
      created: {
        media: 2,
        watchEvents: 1,
        collections: 1,
        collectionItems: 1,
        recommendationSettings: 1,
        recommendationFeedback: 1,
      },
      updated: {
        recommendationSettings: 0,
      },
      skipped: {
        friendships: 1,
        notifications: expect.any(Number),
        collectionInvites: 1,
      },
    });

    const importedMedia = await prisma.userMedia.findMany({
      where: { userId: target.userId },
    });
    expect(importedMedia).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: target.userId,
          media_id: 886201,
          liked: true,
          rating: 8,
          likedNote: 'Imported liked note',
        }),
        expect.objectContaining({
          userId: target.userId,
          media_id: 886202,
          watchlist: true,
          watchlistNote: 'Imported watchlist note',
        }),
      ]),
    );
    expect(importedMedia).not.toEqual(expect.arrayContaining([expect.objectContaining({ userId: source.userId })]));

    expect(
      await prisma.watchEvent.findFirst({
        where: { userId: target.userId, media_id: 886203 },
      }),
    ).toMatchObject({
      userId: target.userId,
      seasonNumber: 1,
      episodeNumber: 3,
      note: 'Imported episode note',
    });
    const importedCollection = await prisma.collection.findFirstOrThrow({
      where: { userId: target.userId, name: 'Imported collection' },
      include: { items: true },
    });
    expect(importedCollection.items).toEqual([
      expect.objectContaining({
        media_id: 886204,
        addedByUserId: target.userId,
      }),
    ]);
    expect(
      await prisma.friendship.count({
        where: {
          OR: [{ senderId: target.userId }, { receiverId: target.userId }],
        },
      }),
    ).toBe(0);
    expect(
      await prisma.collectionInvite.count({
        where: {
          OR: [{ inviterId: target.userId }, { inviteeId: target.userId }],
        },
      }),
    ).toBe(0);
    expect(await prisma.notification.count({ where: { userId: target.userId } })).toBe(0);
    expect(
      await prisma.userActivity.count({
        where: { userId: target.userId, type: { not: 'ACCOUNT_CREATED' } },
      }),
    ).toBe(0);
  });

  it('keeps repeated imports idempotent', async () => {
    const source = await registerTestUser('import-idempotent-source');
    const target = await registerTestUser('import-idempotent-target');

    await updateUserMediaFlag(source, 'watched', true, 886301, {
      watchedNote: 'Imported once',
    });
    await prisma.watchEvent.create({
      data: {
        userId: source.userId,
        media_id: 886301,
        media_type: 'movie',
        note: 'Only one imported event',
      },
    });
    const collection = await createTestCollection(source, 'Idempotent collection');
    await addMovieToCollection(source, collection.id, 886301);

    const exportResponse = await request(await getTestApp())
      .get('/api/user/export')
      .set('Authorization', authorization(source))
      .expect(200);
    const app = await getTestApp();

    await request(app)
      .post('/api/user/import')
      .set('Authorization', authorization(target))
      .send({ export: exportResponse.body })
      .expect(200);
    await request(app)
      .post('/api/user/import')
      .set('Authorization', authorization(target))
      .send({ export: exportResponse.body })
      .expect(200);

    expect(
      await prisma.userMedia.count({
        where: { userId: target.userId, media_id: 886301 },
      }),
    ).toBe(1);
    expect(
      await prisma.watchEvent.count({
        where: { userId: target.userId, media_id: 886301 },
      }),
    ).toBe(2);
    expect(
      await prisma.collection.count({
        where: { userId: target.userId, name: 'Idempotent collection' },
      }),
    ).toBe(1);
    const importedCollection = await prisma.collection.findFirstOrThrow({
      where: { userId: target.userId, name: 'Idempotent collection' },
      include: { items: true },
    });
    expect(importedCollection.items).toHaveLength(1);
  });

  it('imports only selected categories and applies account preferences when explicitly selected', async () => {
    const source = await registerTestUser('selective-import-source');
    const target = await registerTestUser('selective-import-target');
    await prisma.user.update({
      where: { id: source.userId },
      data: {
        profilePrivacy: 'PUBLIC',
        watchedPrivacy: 'FRIENDS',
        watchRegion: 'GB',
      },
    });
    await prisma.navigationPreferences.create({
      data: {
        userId: source.userId,
        config: JSON.stringify({
          version: 1,
          layout: 'scrollable',
          items: [
            { id: 'friends', visible: true, display: 'icon' },
            { id: 'home', visible: true, display: 'label' },
            { id: 'menu', visible: true, display: 'both' },
          ],
        }),
      },
    });
    await updateUserMediaFlag(source, 'liked', true, 886401);

    const exportResponse = await request(await getTestApp())
      .get('/api/user/export')
      .set('Authorization', authorization(source))
      .expect(200);

    const previewResponse = await request(await getTestApp())
      .post('/api/user/import/preview')
      .set('Authorization', authorization(target))
      .send({ export: exportResponse.body })
      .expect(200);
    expect(previewResponse.body.data.availableCategories).toEqual(
      expect.arrayContaining(['accountPreferences', 'mediaTracking']),
    );

    await request(await getTestApp())
      .post('/api/user/import')
      .set('Authorization', authorization(target))
      .send({
        export: exportResponse.body,
        options: { categories: ['accountPreferences'] },
      })
      .expect(200);

    expect(await prisma.user.findUniqueOrThrow({ where: { id: target.userId } })).toMatchObject({
      profilePrivacy: 'PUBLIC',
      watchedPrivacy: 'FRIENDS',
      watchRegion: 'GB',
    });
    expect(await prisma.userMedia.count({ where: { userId: target.userId } })).toBe(0);
    const importedNavigation = await prisma.navigationPreferences.findUniqueOrThrow({ where: { userId: target.userId } });
    const importedNavigationConfig = JSON.parse(importedNavigation.config);
    expect(importedNavigationConfig).toMatchObject({ version: 1, layout: 'scrollable' });
    expect(importedNavigationConfig.items.slice(0, 3)).toEqual([
      { id: 'friends', visible: true, display: 'icon' },
      { id: 'home', visible: true, display: 'label' },
      { id: 'menu', visible: true, display: 'both' },
    ]);
  });

  it('preserves current navigation when imported account preferences contain invalid navigation', async () => {
    const target = await registerTestUser('invalid-navigation-import-target');
    const currentConfig = JSON.stringify({
      version: 1,
      layout: 'grid',
      items: [
        { id: 'home', visible: true, display: 'both' },
        { id: 'menu', visible: true, display: 'icon' },
      ],
    });
    await prisma.navigationPreferences.create({ data: { userId: target.userId, config: currentConfig } });

    await request(await getTestApp())
      .post('/api/user/import')
      .set('Authorization', authorization(target))
      .send({
        export: {
          format: 'kadha-data-export',
          schemaVersion: 2,
          data: {
            accountPreferences: {
              profilePrivacy: 'PUBLIC',
              navigation: {
                version: 1,
                layout: 'compact',
                items: [{ id: 'not-a-destination', visible: true, display: 'both' }],
              },
            },
          },
        },
        options: { categories: ['accountPreferences'] },
      })
      .expect(200);

    expect(await prisma.navigationPreferences.findUniqueOrThrow({ where: { userId: target.userId } })).toMatchObject({
      config: currentConfig,
    });
  });

  it('preserves existing recommendation feedback when importing a conflicting preference', async () => {
    const source = await registerTestUser('feedback-import-source');
    const target = await registerTestUser('feedback-import-target');
    await updateUserMediaFlag(source, 'liked', true, 886501);
    await updateUserMediaFlag(target, 'liked', true, 886501);
    await prisma.recommendationFeedback.create({
      data: {
        userId: source.userId,
        media_id: 886501,
        media_type: 'movie',
        type: 'MORE_LIKE_THIS',
      },
    });
    await prisma.recommendationFeedback.create({
      data: {
        userId: target.userId,
        media_id: 886501,
        media_type: 'movie',
        type: 'LESS_LIKE_THIS',
      },
    });

    const exportResponse = await request(await getTestApp())
      .get('/api/user/export?categories=recommendations')
      .set('Authorization', authorization(source))
      .expect(200);

    await request(await getTestApp())
      .post('/api/user/import')
      .set('Authorization', authorization(target))
      .send({
        export: exportResponse.body,
        options: { categories: ['recommendationFeedback'] },
      })
      .expect(200);

    expect(
      await prisma.recommendationFeedback.findUniqueOrThrow({
        where: {
          userId_media_id_media_type: {
            userId: target.userId,
            media_id: 886501,
            media_type: 'movie',
          },
        },
      }),
    ).toMatchObject({ type: 'LESS_LIKE_THIS' });
  });
});
