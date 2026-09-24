import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';

const provider = vi.hoisted(() => ({ searchMoviesByQuery: vi.fn(), fetchMediaDetails: vi.fn() }));
vi.mock('@/features/media/tmdb.client', () => provider);

const movie = (id: number, title = 'A Film', release_date = '2001-03-02') => ({
  id, title, original_title: title, release_date, poster_path: null, backdrop_path: null,
  overview: '', vote_average: 0, vote_count: 0, popularity: 0, genres: [], original_language: 'en', video: false,
});
const film = {
  uri: 'https://boxd.it/abc', title: 'A Film', year: 2001, watched: true, watchlist: false,
  liked: true, rating: 7, watches: [
    { sourceId: 'diary:2', watchedOn: '2026-01-03' },
    { sourceId: 'diary:3', watchedOn: '2026-01-03' },
  ],
};

describe('Letterboxd import', () => {
  beforeEach(() => {
    provider.searchMoviesByQuery.mockReset().mockResolvedValue({ results: [movie(800001)], total_pages: 1 });
    provider.fetchMediaDetails.mockReset().mockResolvedValue(movie(800001));
  });

  it('previews candidate matches without writing and rejects unauthenticated requests', async () => {
    const app = await getTestApp();
    await request(app).post('/api/user/letterboxd/preview').send({ films: [film] }).expect(401);
    const user = await registerTestUser('letterboxd-preview');
    const response = await request(app).post('/api/user/letterboxd/preview')
      .set('Authorization', authorization(user)).send({ films: [film] }).expect(200);
    expect(response.body.data[0]).toMatchObject({ uri: film.uri, candidates: [{ id: 800001, title: 'A Film' }], suggestedId: 800001 });
    expect(await prisma.userMedia.count({ where: { userId: user.userId } })).toBe(0);
    expect(await prisma.watchEvent.count({ where: { userId: user.userId } })).toBe(0);
  });

  it('requires explicit choice for ambiguous results and refuses invalid input', async () => {
    const user = await registerTestUser('letterboxd-ambiguous');
    const app = await getTestApp();
    provider.searchMoviesByQuery.mockResolvedValue({ results: [movie(800001), movie(800002)], total_pages: 1 });
    const preview = await request(app).post('/api/user/letterboxd/preview')
      .set('Authorization', authorization(user)).send({ films: [film] }).expect(200);
    expect(preview.body.data[0].suggestedId).toBeNull();
    await request(app).post('/api/user/letterboxd/preview')
      .set('Authorization', authorization(user)).send({ films: [{ ...film, year: 0 }] }).expect(400);
  });

  it('does not call a match unique when another exact result is beyond the first ten or on an unchecked page', async () => {
    const user = await registerTestUser('letterboxd-late-exact');
    const app = await getTestApp();
    provider.searchMoviesByQuery.mockResolvedValueOnce({
      results: [movie(800001), ...Array.from({ length: 10 }, (_, index) => movie(801000 + index, 'Other')), movie(800002)],
      total_pages: 1,
    }).mockResolvedValueOnce({ results: [movie(800001)], total_pages: 2 });
    const post = () => request(app).post('/api/user/letterboxd/preview')
      .set('Authorization', authorization(user)).send({ films: [film] }).expect(200);
    expect((await post()).body.data[0].suggestedId).toBeNull();
    expect((await post()).body.data[0].suggestedId).toBeNull();
  });

  it('returns Retry-After while a user already has a matching request in flight', async () => {
    const user = await registerTestUser('letterboxd-busy');
    const app = await getTestApp();
    const response = { results: [movie(800001)], total_pages: 1 };
    let start!: () => void;
    let finish!: (value: typeof response) => void;
    const started = new Promise<void>((resolve) => { start = resolve; });
    provider.searchMoviesByQuery.mockImplementationOnce(() => {
      start();
      return new Promise<typeof response>((resolve) => { finish = resolve; });
    });
    const post = () => request(app).post('/api/user/letterboxd/preview')
      .set('Authorization', authorization(user)).send({ films: [film] });
    const first = post().then((result) => result);
    await started;
    const busy = await post().expect(429);
    expect(busy.headers['retry-after']).toBe('1');
    finish(response);
    expect((await first).status).toBe(200);
    await post().expect(200);
  });

  it('reports a provider failure without importing or guessing a match', async () => {
    const user = await registerTestUser('letterboxd-provider-failure');
    provider.searchMoviesByQuery.mockRejectedValue(new Error('TMDB unavailable'));
    const response = await request(await getTestApp()).post('/api/user/letterboxd/preview')
      .set('Authorization', authorization(user)).send({ films: [film] }).expect(200);
    expect(response.body.data[0]).toMatchObject({ suggestedId: null, candidates: [], error: true });
  });

  it('imports each same-day rewatch once, preserves an existing rating, and remains owner-scoped', async () => {
    const user = await registerTestUser('letterboxd-import');
    const other = await registerTestUser('letterboxd-other');
    const app = await getTestApp();
    const payload = { films: [{ ...film, tmdbId: 800001 }] };
    await request(app).post('/api/user/letterboxd/import').set('Authorization', authorization(user)).send(payload).expect(200);
    await request(app).post('/api/user/letterboxd/import').set('Authorization', authorization(user)).send(payload).expect(200);
    expect(await prisma.watchEvent.count({ where: { userId: user.userId, media_id: 800001 } })).toBe(2);
    expect(await prisma.userMedia.findUnique({ where: { userId_media_id_media_type: { userId: user.userId, media_id: 800001, media_type: 'movie' } } })).toMatchObject({ watched: true, liked: true, rating: 7 });
    expect(await prisma.watchEvent.count({ where: { userId: other.userId } })).toBe(0);
  });

  it('refuses to remap previously imported diary events to another movie', async () => {
    const user = await registerTestUser('letterboxd-remap');
    const app = await getTestApp();
    await request(app).post('/api/user/letterboxd/import').set('Authorization', authorization(user))
      .send({ films: [{ ...film, tmdbId: 800001 }] }).expect(200);
    provider.fetchMediaDetails.mockResolvedValue(movie(800002));
    await request(app).post('/api/user/letterboxd/import').set('Authorization', authorization(user))
      .send({ films: [{ ...film, tmdbId: 800002 }] }).expect(400);
    expect(await prisma.userMedia.count({ where: { userId: user.userId, media_id: 800002 } })).toBe(0);
  });

  it('previews owner-scoped existing titles, preserved ratings, and repeated diary events without writing', async () => {
    const user = await registerTestUser('letterboxd-effects');
    const other = await registerTestUser('letterboxd-effects-other');
    const app = await getTestApp();
    const auth = (record: typeof user) => authorization(record);
    await request(app).post('/api/user/letterboxd/import').set('Authorization', auth(user))
      .send({ films: [{ ...film, tmdbId: 800001 }] }).expect(200);
    const count = await prisma.watchEvent.count({ where: { userId: user.userId } });
    const preview = await request(app).post('/api/user/letterboxd/preview').set('Authorization', auth(user))
      .send({ films: [film] }).expect(200);
    expect(preview.body.data[0]).toMatchObject({ mappedId: 800001, importedWatches: 2,
      candidates: [{ id: 800001, existing: true, ratingKept: true }],
    });
    expect((await request(app).post('/api/user/letterboxd/preview').set('Authorization', auth(other))
      .send({ films: [film] }).expect(200)).body.data[0]).toMatchObject({ mappedId: null, importedWatches: 0,
      candidates: [{ id: 800001, existing: false, ratingKept: false }],
    });
    expect(await prisma.watchEvent.count({ where: { userId: user.userId } })).toBe(count);
  });

  it('rejects remapping a film without diary events and keeps mappings owner-scoped', async () => {
    const user = await registerTestUser('letterboxd-no-diary');
    const other = await registerTestUser('letterboxd-no-diary-other');
    const app = await getTestApp();
    const titleOnly = { ...film, watches: [] };
    const post = (auth: typeof user, tmdbId: number) => request(app).post('/api/user/letterboxd/import')
      .set('Authorization', authorization(auth)).send({ films: [{ ...titleOnly, tmdbId }] });
    await post(user, 800001).expect(200);
    await post(user, 800001).expect(200);
    provider.fetchMediaDetails.mockResolvedValue(movie(800002));
    await post(user, 800002).expect(400);
    await post(other, 800002).expect(200);
    expect(await prisma.userMedia.count({ where: { userId: user.userId } })).toBe(1);
    expect(await prisma.letterboxdFilmMatch.findUnique({ where: { userId_uri: { userId: user.userId, uri: film.uri } } }))
      .toMatchObject({ tmdbId: 800001 });
    await prisma.user.delete({ where: { id: user.userId } });
    expect(await prisma.letterboxdFilmMatch.count({ where: { userId: user.userId } })).toBe(0);
  });

  it('imports a full hundred-film batch atomically', async () => {
    const user = await registerTestUser('letterboxd-full-batch');
    provider.fetchMediaDetails.mockImplementation((_type: string, id: number) => Promise.resolve(movie(id)));
    const films = Array.from({ length: 100 }, (_, index) => ({
      ...film, uri: `https://boxd.it/batch-${index}`, tmdbId: 810000 + index, watches: [],
    }));
    await request(await getTestApp()).post('/api/user/letterboxd/import')
      .set('Authorization', authorization(user)).send({ films }).expect(200);
    expect(await prisma.userMedia.count({ where: { userId: user.userId } })).toBe(100);
    expect(await prisma.letterboxdFilmMatch.count({ where: { userId: user.userId } })).toBe(100);
  });

  it('handles the maximum diary-event batch without a transaction timeout', async () => {
    const user = await registerTestUser('letterboxd-diary-batch');
    provider.fetchMediaDetails.mockImplementation((_type: string, id: number) => Promise.resolve(movie(id)));
    const films = Array.from({ length: 10 }, (_, index) => ({
      ...film, uri: `https://boxd.it/diary-batch-${index}`, tmdbId: 820000 + index,
      watches: Array.from({ length: 200 }, (_, watch) => ({ sourceId: `diary-${watch}`, watchedOn: '2026-01-03' })),
    }));
    await request(await getTestApp()).post('/api/user/letterboxd/import')
      .set('Authorization', authorization(user)).send({ films }).expect(200);
    expect(await prisma.watchEvent.count({ where: { userId: user.userId } })).toBe(2000);
  }, 60_000);

  it('does not replace a saved rating or invent dated diary entries for undated watched films', async () => {
    const user = await registerTestUser('letterboxd-existing');
    const app = await getTestApp();
    await prisma.mediaSnapshot.create({ data: { media_id: 800001, media_type: 'movie', title: 'A Film' } });
    await prisma.userMedia.create({ data: { userId: user.userId, media_id: 800001, media_type: 'movie', rating: 9 } });
    await request(app).post('/api/user/letterboxd/import').set('Authorization', authorization(user))
      .send({ films: [{ ...film, watches: [], tmdbId: 800001 }] }).expect(200);
    expect(await prisma.userMedia.findUnique({ where: { userId_media_id_media_type: { userId: user.userId, media_id: 800001, media_type: 'movie' } } })).toMatchObject({ watched: true, rating: 9, watchedOn: null });
    expect(await prisma.watchEvent.count({ where: { userId: user.userId } })).toBe(0);
  });
});
