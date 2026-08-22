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
    await createTestCollection(user, 'Export collection');
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
      app: {
        name: 'Kadha',
        version: expect.any(String),
      },
      account: {
        id: user.userId,
        username: user.username,
      },
    });
    expect(exported.account).not.toHaveProperty('password');
    expect(exported.media).toHaveLength(1);
    expect(exported.media[0]).toMatchObject({
      userId: user.userId,
      media_id: 885101,
      liked: true,
      media: {
        title: 'Test Movie 885101',
      },
    });
    expect(exported.episodeWatches).toEqual([
      expect.objectContaining({
        userId: user.userId,
        media_id: 885102,
        media_type: 'tv',
        seasonNumber: 1,
        episodeNumber: 2,
        note: 'Exported episode note',
      }),
    ]);
    expect(exported.watchEvents).toEqual(exported.episodeWatches);
    expect(exported.collections).toHaveLength(1);
    expect(exported.collections[0]).toMatchObject({
      userId: user.userId,
      name: 'Export collection',
    });
    expect(exported.friendships).toHaveLength(1);
    expect(exported.notifications).toHaveLength(1);
    expect(exported.activity.length).toBeGreaterThanOrEqual(3);
  });
});
