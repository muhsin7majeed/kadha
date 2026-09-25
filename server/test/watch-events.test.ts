import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';
import { buildTestMediaPayload, getCurrentUserMediaList } from './helpers/user-media';

describe('watch event routes', () => {
  it('records intentional same-day rewatches and exposes their derived summary', async () => {
    const user = await registerTestUser('rewatch-user');
    const app = await getTestApp();
    const mediaId = 889101;
    const payload = buildTestMediaPayload({ mediaId });

    await request(app)
      .post('/api/user-media/watch-events')
      .set('Authorization', authorization(user))
      .send({ ...payload, watchedOn: '2026-01-15', note: 'First viewing.' })
      .expect(201);

    const response = await request(app)
      .post('/api/user-media/watch-events')
      .set('Authorization', authorization(user))
      .send({ ...payload, watchedOn: '2026-01-15', note: 'Immediate rewatch.' })
      .expect(201);

    expect(response.body.data).toMatchObject({
      watchCount: 2,
      lastWatchedAt: expect.any(String),
      lastWatchedOn: '2026-01-15',
      events: [
        expect.objectContaining({
          watchedOn: '2026-01-15',
          note: 'Immediate rewatch.',
        }),
        expect.objectContaining({
          watchedOn: '2026-01-15',
          note: 'First viewing.',
        }),
      ],
    });

    await request(app)
      .patch(`/api/user-media/watch-events/${response.body.data.events[1].id}`)
      .set('Authorization', authorization(user))
      .send({ watchedOn: '2026-01-14', note: 'Corrected first viewing.', rating: 7 })
      .expect(200);

    const watched = await getCurrentUserMediaList(user, 'watched');
    expect(watched.data[0]).toMatchObject({
      media_id: mediaId,
      watched: true,
      watchlist: false,
      watchCount: 2,
      rating: 7,
      watchedOn: '2026-01-15',
      watchedNote: 'Immediate rewatch.',
    });
  });

  it('preserves movie and TV watchlist details for title events when retention is enabled', async () => {
    const user = await registerTestUser('title-event-watchlist-retention-user');
    const app = await getTestApp();
    await prisma.trackingPreferences.create({
      data: {
        userId: user.userId,
        config: JSON.stringify({
          version: 1,
          keepWatchedOnWatchlist: true,
          hideCaughtUpWithoutScheduledNext: false,
        }),
      },
    });

    for (const [mediaId, mediaType] of [
      [889102, 'movie'],
      [889103, 'tv'],
    ] as const) {
      const payload = buildTestMediaPayload({
        mediaId,
        mediaType,
        title: `Watchlisted ${mediaType}`,
      });
      await request(app)
        .post('/api/user-media/watchlist')
        .set('Authorization', authorization(user))
        .send({ ...payload, watchlist: true, watchlistNote: `Keep this ${mediaType} event` })
        .expect(200);
      const watchlistAt = (
        await prisma.userMedia.findUniqueOrThrow({
          where: {
            userId_media_id_media_type: { userId: user.userId, media_id: mediaId, media_type: mediaType },
          },
        })
      ).watchlistAt;

      const response = await request(app)
        .post('/api/user-media/watch-events')
        .set('Authorization', authorization(user))
        .send({ ...payload, watchedOn: '2026-01-15', note: `Watched ${mediaType}` })
        .expect(201);

      expect(response.body.data).toMatchObject({
        watchCount: 1,
        events: [
          expect.objectContaining({
            media_id: mediaId,
            media_type: mediaType,
            seasonNumber: null,
            episodeNumber: null,
            watchedOn: '2026-01-15',
            note: `Watched ${mediaType}`,
          }),
        ],
      });
      expect(
        await prisma.userMedia.findUniqueOrThrow({
          where: {
            userId_media_id_media_type: { userId: user.userId, media_id: mediaId, media_type: mediaType },
          },
        }),
      ).toMatchObject({
        watched: true,
        watchlist: true,
        watchlistAt,
        watchlistNote: `Keep this ${mediaType} event`,
      });
      expect(
        await prisma.watchEvent.count({
          where: {
            userId: user.userId,
            media_id: mediaId,
            media_type: mediaType,
            seasonNumber: null,
            episodeNumber: null,
          },
        }),
      ).toBe(1);
    }

    expect(
      await prisma.userActivity.count({
        where: { userId: user.userId, type: 'MEDIA_REMOVED_FROM_WATCHLIST' },
      }),
    ).toBe(0);
  });

  it('clears watchlist details for title events by default without changing event persistence', async () => {
    const user = await registerTestUser('title-event-watchlist-default-user');
    const app = await getTestApp();
    const mediaId = 889104;
    const payload = buildTestMediaPayload({
      mediaId,
      mediaType: 'tv',
      title: 'Default Watchlisted Show',
    });
    await request(app)
      .post('/api/user-media/watchlist')
      .set('Authorization', authorization(user))
      .send({ ...payload, watchlist: true, watchlistNote: 'Keep this note after removal' })
      .expect(200);

    const response = await request(app)
      .post('/api/user-media/watch-events')
      .set('Authorization', authorization(user))
      .send({ ...payload, watchedOn: '2026-01-15', note: 'Default title event' })
      .expect(201);

    expect(response.body.data).toMatchObject({
      watchCount: 1,
      events: [expect.objectContaining({ media_id: mediaId, media_type: 'tv', note: 'Default title event' })],
    });
    expect(
      await prisma.userMedia.findUniqueOrThrow({
        where: {
          userId_media_id_media_type: { userId: user.userId, media_id: mediaId, media_type: 'tv' },
        },
      }),
    ).toMatchObject({
      watched: true,
      watchlist: false,
      watchlistAt: null,
      watchlistNote: 'Keep this note after removal',
    });
    expect(
      await prisma.userActivity.count({
        where: { userId: user.userId, type: 'MEDIA_REMOVED_FROM_WATCHLIST' },
      }),
    ).toBe(0);
  });

  it('preserves TV watchlist state when recording an episode', async () => {
    const user = await registerTestUser('episode-watchlist-user');
    const app = await getTestApp();
    const mediaId = 889102;
    const watchlistAt = new Date('2026-01-12T12:00:00.000Z');
    const payload = buildTestMediaPayload({ mediaId, mediaType: 'tv', title: 'Watchlisted Show' });

    await request(app)
      .post('/api/user-media/watchlist')
      .set('Authorization', authorization(user))
      .send({ ...payload, watchlist: true })
      .expect(200);
    await prisma.userMedia.update({
      where: {
        userId_media_id_media_type: {
          userId: user.userId,
          media_id: mediaId,
          media_type: 'tv',
        },
      },
      data: { watchlistAt },
    });

    await request(app)
      .post('/api/user-media/watch-events')
      .set('Authorization', authorization(user))
      .send({ ...payload, seasonNumber: 1, episodeNumber: 1 })
      .expect(201);

    const userMedia = await prisma.userMedia.findUniqueOrThrow({
      where: {
        userId_media_id_media_type: {
          userId: user.userId,
          media_id: mediaId,
          media_type: 'tv',
        },
      },
    });
    expect(userMedia).toMatchObject({ watchlist: true, watchlistAt });
  });

  it('uses a client request ID to make retried creates idempotent', async () => {
    const user = await registerTestUser('rewatch-idempotent-user');
    const app = await getTestApp();
    const payload = {
      ...buildTestMediaPayload({ mediaId: 889201 }),
      watchedOn: '2026-02-03',
      clientRequestId: 'watch-form-889201-1',
    };

    await request(app)
      .post('/api/user-media/watch-events')
      .set('Authorization', authorization(user))
      .send(payload)
      .expect(201);
    const retry = await request(app)
      .post('/api/user-media/watch-events')
      .set('Authorization', authorization(user))
      .send(payload)
      .expect(201);

    expect(retry.body.data.watchCount).toBe(1);
    expect(await prisma.watchEvent.count({ where: { userId: user.userId } })).toBe(1);
  });

  it('edits and deletes only the current user watch events while keeping the title projection current', async () => {
    const owner = await registerTestUser('rewatch-owner');
    const otherUser = await registerTestUser('rewatch-other-user');
    const app = await getTestApp();
    const mediaId = 889301;
    const payload = buildTestMediaPayload({ mediaId });

    const created = await request(app)
      .post('/api/user-media/watch-events')
      .set('Authorization', authorization(owner))
      .send({ ...payload, watchedOn: '2026-03-01', note: 'Original note.' })
      .expect(201);
    const eventId = created.body.data.events[0].id as string;

    await request(app)
      .patch(`/api/user-media/watch-events/${eventId}`)
      .set('Authorization', authorization(otherUser))
      .send({ note: 'Not allowed.' })
      .expect(404);

    const edited = await request(app)
      .patch(`/api/user-media/watch-events/${eventId}`)
      .set('Authorization', authorization(owner))
      .send({ watchedOn: '2026-03-02', note: 'Corrected note.', rating: 9 })
      .expect(200);

    expect(edited.body.data.events[0]).toMatchObject({
      watchedOn: '2026-03-02',
      note: 'Corrected note.',
      rating: null,
    });

    const watched = await getCurrentUserMediaList(owner, 'watched');
    expect(watched.data[0]?.rating).toBe(9);

    const deleted = await request(app)
      .delete(`/api/user-media/watch-events/${eventId}`)
      .set('Authorization', authorization(owner))
      .expect(200);

    expect(deleted.body.data).toMatchObject({ watchCount: 0, events: [] });
    expect((await getCurrentUserMediaList(owner, 'watched')).pagination.total).toBe(0);
  });
});
