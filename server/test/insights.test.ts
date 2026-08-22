import { MediaCreditKind, MediaMetadataStatus, MediaType } from '@prisma/client';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';
import { updateUserMediaFlag } from './helpers/user-media';

const seedInsightMetadata = async (mediaId: number, index: number) => {
  const snapshot = await prisma.mediaSnapshot.findUniqueOrThrow({
    where: {
      media_id_media_type: {
        media_id: mediaId,
        media_type: MediaType.movie,
      },
    },
  });

  await prisma.genre.upsert({
    where: { id: 18 },
    update: { name: 'Drama' },
    create: { id: 18, name: 'Drama' },
  });
  await prisma.genre.upsert({
    where: { id: 53 },
    update: { name: 'Thriller' },
    create: { id: 53, name: 'Thriller' },
  });
  await prisma.person.upsert({
    where: { id: 9001 },
    update: { name: 'Frequent Actor' },
    create: { id: 9001, name: 'Frequent Actor', knownForDepartment: 'Acting' },
  });
  await prisma.person.upsert({
    where: { id: 9002 },
    update: { name: 'Frequent Director' },
    create: {
      id: 9002,
      name: 'Frequent Director',
      knownForDepartment: 'Directing',
    },
  });
  await prisma.mediaGenre.createMany({
    data: [
      { mediaSnapshotId: snapshot.id, genreId: 18 },
      ...(index < 2 ? [{ mediaSnapshotId: snapshot.id, genreId: 53 }] : []),
    ],
  });
  await prisma.mediaCredit.createMany({
    data: [
      {
        mediaSnapshotId: snapshot.id,
        personId: 9001,
        creditKey: `CAST:actor-${mediaId}`,
        kind: MediaCreditKind.CAST,
        billingOrder: 0,
      },
      {
        mediaSnapshotId: snapshot.id,
        personId: 9002,
        creditKey: `CREW:director-${mediaId}`,
        kind: MediaCreditKind.CREW,
        department: 'Directing',
        job: 'Director',
      },
    ],
  });
  await prisma.mediaSnapshot.update({
    where: { id: snapshot.id },
    data: { metadataStatus: MediaMetadataStatus.READY, metadataVersion: 1 },
  });
};

describe('viewing insights', () => {
  it('returns stable all-time viewing and taste rankings for the current user', async () => {
    const user = await registerTestUser('insights-owner');
    const mediaIds = [882001, 882002, 882003, 882004, 882005];

    for (const [index, mediaId] of mediaIds.entries()) {
      await updateUserMediaFlag(user, 'watched', true, mediaId, {
        liked: index < 3,
        rating: index < 3 ? 8 + index : undefined,
      });
      await seedInsightMetadata(mediaId, index);
    }

    const response = await request(await getTestApp())
      .get('/api/user/insights?mediaType=all')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body.data).toMatchObject({
      schemaVersion: 1,
      scope: {
        period: 'all',
        mediaType: 'all',
        basis: 'CURRENT_TRACKED_STATE',
      },
      summary: {
        watchedTitleCount: 5,
        movieCount: 5,
        tvSeriesCount: 0,
        watchedEpisodeCount: 0,
        personalRating: { average: 9, sampleSize: 3 },
      },
      viewingSignature: {
        status: 'AVAILABLE',
        topGenre: { label: 'Drama', value: 5 },
        topMovieDirector: { label: 'Frequent Director', value: 5 },
        topCastMember: { label: 'Frequent Actor', value: 5 },
      },
      coverage: {
        eligibleTitleCount: 5,
        genres: { coveredTitleCount: 5, ratio: 1, status: 'COMPLETE' },
        credits: { coveredTitleCount: 5, ratio: 1, status: 'COMPLETE' },
      },
    });
    expect(response.body.data.rankings.genres).toEqual([
      expect.objectContaining({ label: 'Drama', rank: 1, value: 5, share: 1 }),
      expect.objectContaining({
        label: 'Thriller',
        rank: 2,
        value: 2,
        share: 0.4,
      }),
    ]);
    expect(response.body.data.rankings.likedGenres[0]).toMatchObject({
      label: 'Drama',
      value: 3,
    });
    expect(response.body.data.rankings.highestRatedGenres[0]).toMatchObject({
      label: 'Drama',
      value: 9,
      unit: 'rating',
      sampleSize: 3,
    });
  });

  it('keeps insights private to the authenticated account and validates filters', async () => {
    const owner = await registerTestUser('insights-private-owner');
    const otherUser = await registerTestUser('insights-private-other');

    await updateUserMediaFlag(owner, 'watched', true, 882101);

    const otherResponse = await request(await getTestApp())
      .get('/api/user/insights')
      .set('Authorization', authorization(otherUser))
      .expect(200);

    expect(otherResponse.body.data.summary.watchedTitleCount).toBe(0);

    await request(await getTestApp())
      .get('/api/user/insights?mediaType=invalid')
      .set('Authorization', authorization(owner))
      .expect(400);

    await request(await getTestApp())
      .get('/api/user/insights')
      .expect(401);
  });
});
