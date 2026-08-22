import { MediaCreditKind, MediaMetadataStatus, MediaType } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const tmdbClient = vi.hoisted(() => ({
  fetchMediaDetails: vi.fn(),
  fetchMovieCredits: vi.fn(),
  fetchTvAggregateCredits: vi.fn(),
}));

vi.mock('@/features/media/tmdb.client', () => tmdbClient);

import { processNextMediaMetadataJob } from '@/features/media/media-metadata.service';
import { prisma } from '@/lib/prisma';

describe('media metadata enrichment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enriches one shared movie snapshot and removes its durable job', async () => {
    const snapshot = await prisma.mediaSnapshot.create({
      data: {
        media_id: 889001,
        media_type: MediaType.movie,
        title: 'Initial title',
        metadataJob: { create: {} },
      },
    });
    tmdbClient.fetchMediaDetails.mockResolvedValue({
      id: 889001,
      adult: false,
      backdrop_path: null,
      belongs_to_collection: null,
      budget: 0,
      genres: [{ id: 18, name: 'Drama' }],
      homepage: null,
      imdb_id: null,
      original_language: 'en',
      original_title: 'Enriched movie',
      overview: 'Enriched overview',
      popularity: 10,
      poster_path: null,
      production_companies: [],
      production_countries: [],
      release_date: '2025-01-01',
      revenue: 0,
      runtime: 112,
      spoken_languages: [],
      status: 'Released',
      tagline: null,
      title: 'Enriched movie',
      video: false,
      vote_average: 8,
      vote_count: 100,
    });
    tmdbClient.fetchMovieCredits.mockResolvedValue({
      id: 889001,
      cast: [
        {
          id: 9901,
          name: 'Lead Actor',
          profile_path: '/actor.jpg',
          known_for_department: 'Acting',
          character: 'Lead',
          credit_id: 'cast-credit',
          order: 0,
        },
        {
          id: 9901,
          name: 'Lead Actor',
          profile_path: '/actor.jpg',
          known_for_department: 'Acting',
          character: 'Lead',
          credit_id: 'cast-credit',
          order: 0,
        },
      ],
      crew: [
        {
          id: 9902,
          name: 'Movie Director',
          profile_path: '/director.jpg',
          known_for_department: 'Directing',
          credit_id: 'director-credit',
          department: 'Directing',
          job: 'Director',
        },
      ],
    });

    await expect(processNextMediaMetadataJob()).resolves.toBe(true);

    const enriched = await prisma.mediaSnapshot.findUniqueOrThrow({
      where: { id: snapshot.id },
      include: {
        genres: { include: { genre: true } },
        credits: { include: { person: true } },
        metadataJob: true,
      },
    });

    expect(enriched).toMatchObject({
      title: 'Enriched movie',
      runtime: 112,
      metadataStatus: MediaMetadataStatus.READY,
      metadataVersion: 1,
      metadataJob: null,
    });
    expect(enriched.genres[0]?.genre).toMatchObject({ id: 18, name: 'Drama' });
    expect(enriched.credits).toHaveLength(2);
    expect(enriched.credits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: MediaCreditKind.CAST,
          person: expect.objectContaining({ name: 'Lead Actor' }),
        }),
        expect.objectContaining({
          kind: MediaCreditKind.CREW,
          job: 'Director',
          person: expect.objectContaining({ name: 'Movie Director' }),
        }),
      ]),
    );
  });
});
