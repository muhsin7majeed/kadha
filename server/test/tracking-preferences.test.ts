import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';
import { updateUserMediaFlag } from './helpers/user-media';

const defaults = {
  version: 1,
  keepWatchedOnWatchlist: false,
  hideCaughtUpWithoutScheduledNext: false,
};

describe('tracking preferences', () => {
  it('requires authentication', async () => {
    const app = await getTestApp();

    await request(app).get('/api/user-media/tracking-preferences').expect(401);
    await request(app).put('/api/user-media/tracking-preferences').send(defaults).expect(401);
  });

  it('returns both flags off without creating a preference row', async () => {
    const user = await registerTestUser('tracking-preferences-defaults');

    const response = await request(await getTestApp())
      .get('/api/user-media/tracking-preferences')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body.data).toEqual(defaults);
    expect(await prisma.trackingPreferences.count()).toBe(0);
  });

  it('stores a validated versioned document for only the current account', async () => {
    const owner = await registerTestUser('tracking-preferences-owner');
    const other = await registerTestUser('tracking-preferences-other');
    const preferences = {
      version: 1,
      keepWatchedOnWatchlist: true,
      hideCaughtUpWithoutScheduledNext: true,
    };

    const saved = await request(await getTestApp())
      .put('/api/user-media/tracking-preferences')
      .set('Authorization', authorization(owner))
      .send(preferences)
      .expect(200);

    expect(saved.body.data).toEqual(preferences);
    expect(
      JSON.parse((await prisma.trackingPreferences.findUniqueOrThrow({ where: { userId: owner.userId } })).config),
    ).toEqual(preferences);

    const ownResponse = await request(await getTestApp())
      .get('/api/user-media/tracking-preferences')
      .set('Authorization', authorization(owner))
      .expect(200);
    expect(ownResponse.body.data).toEqual(preferences);

    const otherResponse = await request(await getTestApp())
      .get('/api/user-media/tracking-preferences')
      .set('Authorization', authorization(other))
      .expect(200);
    expect(otherResponse.body.data).toEqual(defaults);
  });

  it('rejects incomplete, unknown, incorrectly typed, and unsupported documents', async () => {
    const user = await registerTestUser('tracking-preferences-invalid');
    const app = await getTestApp();
    const auth = authorization(user);

    const invalidDocuments = [
      { version: 1, keepWatchedOnWatchlist: true },
      { ...defaults, unknownPreference: true },
      { ...defaults, keepWatchedOnWatchlist: 'yes' },
      { ...defaults, version: 2 },
    ];

    for (const document of invalidDocuments) {
      await request(app)
        .put('/api/user-media/tracking-preferences')
        .set('Authorization', auth)
        .send(document)
        .expect(400);
    }

    expect(await prisma.trackingPreferences.count({ where: { userId: user.userId } })).toBe(0);
  });

  it('normalizes an older stored document with missing keys and drops unknown keys', async () => {
    const user = await registerTestUser('tracking-preferences-older');
    await prisma.trackingPreferences.create({
      data: {
        userId: user.userId,
        config: JSON.stringify({
          version: 1,
          keepWatchedOnWatchlist: true,
          retiredPreference: true,
        }),
      },
    });

    const response = await request(await getTestApp())
      .get('/api/user-media/tracking-preferences')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body.data).toEqual({
      version: 1,
      keepWatchedOnWatchlist: true,
      hideCaughtUpWithoutScheduledNext: false,
    });
  });

  it('does not change existing watchlist records when preferences are toggled', async () => {
    const user = await registerTestUser('tracking-preferences-watchlist');
    await updateUserMediaFlag(user, 'watchlist', true, 887001, {
      watchlistNote: 'Keep this saved',
    });
    const before = await prisma.userMedia.findUniqueOrThrow({
      where: {
        userId_media_id_media_type: {
          userId: user.userId,
          media_id: 887001,
          media_type: 'movie',
        },
      },
    });

    await request(await getTestApp())
      .put('/api/user-media/tracking-preferences')
      .set('Authorization', authorization(user))
      .send({
        version: 1,
        keepWatchedOnWatchlist: true,
        hideCaughtUpWithoutScheduledNext: true,
      })
      .expect(200);

    const after = await prisma.userMedia.findUniqueOrThrow({
      where: {
        userId_media_id_media_type: {
          userId: user.userId,
          media_id: 887001,
          media_type: 'movie',
        },
      },
    });
    expect(after).toMatchObject({
      watchlist: true,
      watchlistAt: before.watchlistAt,
      watchlistNote: 'Keep this saved',
    });
  });
});
