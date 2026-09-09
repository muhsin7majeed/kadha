import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';
import { createTestCollection } from './helpers/collection';
import { updateUserMediaFlag } from './helpers/user-media';
import { prisma } from '@/lib/prisma';

describe('user data export', () => {
  it('exports the current user account, media, collections, social, notifications, and activity data', async () => {
    const user = await registerTestUser('export-user');
    const sender = await registerTestUser('export-sender');

    await updateUserMediaFlag(user, 'liked', true, 885101);
    await prisma.recommendationSettings.create({
      data: {
        userId: user.userId,
        useWatchlist: true,
      },
    });
    await prisma.recommendationFeedback.create({
      data: {
        userId: user.userId,
        media_id: 885101,
        media_type: 'movie',
        type: 'MORE_LIKE_THIS',
      },
    });
    await prisma.navigationPreferences.create({
      data: {
        userId: user.userId,
        config: JSON.stringify({
          version: 1,
          layout: 'grid',
          items: [
            { id: 'menu', visible: true, display: 'icon' },
            { id: 'home', visible: true, display: 'label' },
          ],
        }),
      },
    });
    await prisma.watchEvent.create({
      data: {
        userId: user.userId,
        media_id: 885102,
        media_type: 'tv',
        seasonNumber: 1,
        episodeNumber: 2,
        episodeId: 1002,
        note: 'Exported episode note',
      },
    });
    const collection = await createTestCollection(user, 'Export collection');
    await prisma.collectionMember.create({
      data: {
        collectionId: collection.id,
        userId: sender.userId,
        role: 'VIEWER',
      },
    });
    await request(await getTestApp())
      .post('/api/friendship/send-friend-request')
      .set('Authorization', authorization(sender))
      .send({ receiverId: user.userId })
      .expect(201);

    const response = await request(await getTestApp())
      .get('/api/user/export')
      .set('Authorization', authorization(user))
      .expect(200);

    const exported = response.body;

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.headers['content-disposition']).toContain('kadha-export-export-user-');
    expect(exported).toMatchObject({
      format: 'kadha-data-export',
      schemaVersion: 2,
      app: {
        name: 'Kadha',
        version: expect.any(String),
      },
      manifest: {
        selected: expect.arrayContaining(['accountPreferences', 'mediaTracking', 'watchHistory', 'collections']),
        excluded: expect.arrayContaining(['passwords', 'sessions', 'account IDs']),
      },
      data: {
        accountPreferences: {
          username: user.username,
          navigation: {
            version: 1,
            layout: 'grid',
            items: expect.arrayContaining([
              { id: 'menu', visible: true, display: 'icon' },
              { id: 'home', visible: true, display: 'label' },
            ]),
          },
        },
      },
    });
    expect(exported.data.accountPreferences).not.toHaveProperty('password');
    expect(exported.data.accountPreferences).not.toHaveProperty('id');
    expect(JSON.stringify(exported)).not.toContain(user.userId);
    expect(JSON.stringify(exported)).not.toContain(sender.userId);
    expect(exported.data.mediaTracking).toHaveLength(1);
    expect(exported.data.mediaTracking[0]).toMatchObject({
      media_id: 885101,
      liked: true,
    });
    expect(exported.data.mediaSnapshots).toEqual(
      expect.arrayContaining([expect.objectContaining({ title: 'Test Movie 885101' })]),
    );
    expect(exported.data.watchEvents).toEqual([
      expect.objectContaining({
        media_id: 885102,
        media_type: 'tv',
        seasonNumber: 1,
        episodeNumber: 2,
        note: 'Exported episode note',
      }),
    ]);
    expect(exported.data).not.toHaveProperty('episodeWatches');
    expect(exported.data.collections).toHaveLength(1);
    expect(exported.data.collections[0]).toMatchObject({
      name: 'Export collection',
    });
    expect(exported.data.collectionMemberships).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          collection: 'Export collection',
          owner: user.username,
          member: sender.username,
          role: 'VIEWER',
        }),
      ]),
    );
    expect(exported.data.friendships).toHaveLength(1);
    expect(exported.data.notifications).toHaveLength(1);
    expect(exported.data.activity.length).toBeGreaterThanOrEqual(3);
    expect(exported.data.recommendationSettings).toMatchObject({
      useLiked: true,
      useRatings: true,
      useWatched: true,
      useRewatchHistory: true,
      useWatchlist: true,
      excludeWatched: true,
    });
    expect(exported.data.recommendationFeedback).toEqual([
      expect.objectContaining({
        media_id: 885101,
        media_type: 'movie',
        type: 'MORE_LIKE_THIS',
      }),
    ]);
  });

  it('exports only selected categories while retaining required media snapshots', async () => {
    const user = await registerTestUser('selective-export-user');
    await updateUserMediaFlag(user, 'liked', true, 885201);

    const response = await request(await getTestApp())
      .get('/api/user/export?categories=mediaTracking')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body.manifest.selected).toEqual(['mediaTracking']);
    expect(response.body.data.mediaTracking).toHaveLength(1);
    expect(response.body.data.mediaSnapshots).toHaveLength(1);
    expect(response.body.data).not.toHaveProperty('accountPreferences');
    expect(response.body.data).not.toHaveProperty('watchEvents');
    expect(response.body.data).not.toHaveProperty('activity');
  });

  it('includes media snapshot dependencies when exporting watch history alone', async () => {
    const user = await registerTestUser('watch-history-export-user');
    await updateUserMediaFlag(user, 'watched', true, 885301);
    await prisma.watchEvent.create({
      data: {
        userId: user.userId,
        media_id: 885301,
        media_type: 'movie',
      },
    });

    const response = await request(await getTestApp())
      .get('/api/user/export?categories=watchHistory')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body.data.watchEvents).toHaveLength(2);
    expect(response.body.data.mediaSnapshots).toEqual(
      expect.arrayContaining([expect.objectContaining({ media_id: 885301, media_type: 'movie' })]),
    );
    expect(response.body.data).not.toHaveProperty('mediaTracking');
  });
});
