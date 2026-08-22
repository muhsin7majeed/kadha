import { randomUUID } from 'node:crypto';
import { isAxiosError } from 'axios';
import { MediaCreditKind, MediaType, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import {
  TMDBCreditPerson,
  TMDBMovieCredits,
  TMDBMovieDetails,
  TMDBTvAggregateCredits,
  TMDBTvDetails,
} from './media.types';
import { fetchMediaDetails, fetchMovieCredits, fetchTvAggregateCredits } from './tmdb.client';

const METADATA_VERSION = 1;
const MAX_ATTEMPTS = 5;
const LOCK_TIMEOUT_MS = 5 * 60 * 1000;
const WORKER_INTERVAL_MS = 2_000;

interface NormalizedPerson {
  id: number;
  name: string;
  profilePath: string | null;
  knownForDepartment: string | null;
}

interface NormalizedCredit {
  person: NormalizedPerson;
  creditKey: string;
  tmdbCreditId: string | null;
  kind: MediaCreditKind;
  department: string | null;
  job: string | null;
  character: string | null;
  billingOrder: number | null;
  aggregateEpisodeCount: number | null;
}

const normalizePerson = (person: TMDBCreditPerson): NormalizedPerson => ({
  id: person.id,
  name: person.name,
  profilePath: person.profile_path,
  knownForDepartment: person.known_for_department ?? null,
});

const getCreditKey = (
  kind: MediaCreditKind,
  personId: number,
  tmdbCreditId: string | undefined,
  fallbackParts: Array<string | number | null | undefined>,
) =>
  tmdbCreditId ? `${kind}:${tmdbCreditId}` : [kind, personId, ...fallbackParts.map((part) => part ?? '')].join(':');

const normalizeMovieCredits = (credits: TMDBMovieCredits): NormalizedCredit[] => [
  ...credits.cast.map((credit) => ({
    person: normalizePerson(credit),
    creditKey: getCreditKey(MediaCreditKind.CAST, credit.id, credit.credit_id, [credit.character, credit.order]),
    tmdbCreditId: credit.credit_id,
    kind: MediaCreditKind.CAST,
    department: 'Acting',
    job: 'Actor',
    character: credit.character,
    billingOrder: credit.order,
    aggregateEpisodeCount: null,
  })),
  ...credits.crew.map((credit) => ({
    person: normalizePerson(credit),
    creditKey: getCreditKey(MediaCreditKind.CREW, credit.id, credit.credit_id, [credit.department, credit.job]),
    tmdbCreditId: credit.credit_id,
    kind: MediaCreditKind.CREW,
    department: credit.department,
    job: credit.job,
    character: null,
    billingOrder: null,
    aggregateEpisodeCount: null,
  })),
];

const normalizeTvCredits = (details: TMDBTvDetails, credits: TMDBTvAggregateCredits): NormalizedCredit[] => [
  ...credits.cast.flatMap((credit) =>
    credit.roles.map((role) => ({
      person: normalizePerson(credit),
      creditKey: getCreditKey(MediaCreditKind.CAST, credit.id, role.credit_id, [role.character, credit.order]),
      tmdbCreditId: role.credit_id,
      kind: MediaCreditKind.CAST,
      department: 'Acting',
      job: 'Actor',
      character: role.character,
      billingOrder: credit.order,
      aggregateEpisodeCount: role.episode_count,
    })),
  ),
  ...credits.crew.flatMap((credit) =>
    credit.jobs.map((job) => ({
      person: normalizePerson(credit),
      creditKey: getCreditKey(MediaCreditKind.CREW, credit.id, job.credit_id, [credit.department, job.job]),
      tmdbCreditId: job.credit_id,
      kind: MediaCreditKind.CREW,
      department: credit.department,
      job: job.job,
      character: null,
      billingOrder: null,
      aggregateEpisodeCount: job.episode_count,
    })),
  ),
  ...details.created_by.map((creator) => ({
    person: {
      id: creator.id,
      name: creator.name,
      profilePath: creator.profile_path,
      knownForDepartment: 'Creator',
    },
    creditKey: getCreditKey(MediaCreditKind.CREATOR, creator.id, creator.credit_id, ['Creator']),
    tmdbCreditId: creator.credit_id,
    kind: MediaCreditKind.CREATOR,
    department: 'Creator',
    job: 'Creator',
    character: null,
    billingOrder: null,
    aggregateEpisodeCount: null,
  })),
];

const getFailureCode = (error: unknown) => {
  if (isAxiosError(error)) {
    return error.response?.status ? `TMDB_HTTP_${error.response.status}` : 'TMDB_REQUEST_FAILED';
  }

  return 'METADATA_ENRICHMENT_FAILED';
};

const getFailureMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    return `${error.message}${error.response?.status ? ` (${error.response.status})` : ''}`.slice(0, 300);
  }

  return error instanceof Error ? error.message.slice(0, 300) : 'Unknown metadata enrichment failure';
};

const getRetryDate = (attempts: number) => {
  const delayMs = Math.min(60 * 60 * 1000, 5_000 * 2 ** Math.max(attempts - 1, 0));
  return new Date(Date.now() + delayMs);
};

const claimNextJob = async () => {
  const now = new Date();
  const staleLock = new Date(now.getTime() - LOCK_TIMEOUT_MS);
  const job = await prisma.mediaMetadataJob.findFirst({
    where: {
      availableAt: { lte: now },
      OR: [{ lockedAt: null }, { lockedAt: { lt: staleLock } }],
    },
    orderBy: [{ availableAt: 'asc' }, { createdAt: 'asc' }],
  });

  if (!job) return null;

  const claimed = await prisma.mediaMetadataJob.updateMany({
    where: {
      id: job.id,
      OR: [{ lockedAt: null }, { lockedAt: { lt: staleLock } }],
    },
    data: { lockedAt: now },
  });

  if (claimed.count === 0) return null;

  return prisma.mediaMetadataJob.findUnique({
    where: { id: job.id },
    include: { media: true },
  });
};

const persistMetadata = async (
  mediaSnapshotId: string,
  mediaType: MediaType,
  details: TMDBMovieDetails | TMDBTvDetails,
  credits: NormalizedCredit[],
) => {
  const now = new Date();
  const genres = details.genres;
  const uniqueCredits = [...new Map(credits.map((credit) => [credit.creditKey, credit])).values()];
  const people = [...new Map(uniqueCredits.map((credit) => [credit.person.id, credit.person])).values()];
  const snapshotUpdate: Prisma.MediaSnapshotUpdateInput =
    mediaType === MediaType.movie
      ? {
          title: (details as TMDBMovieDetails).title,
          original_title: (details as TMDBMovieDetails).original_title,
          overview: details.overview,
          poster_path: details.poster_path,
          backdrop_path: details.backdrop_path,
          vote_average: details.vote_average,
          vote_count: details.vote_count,
          popularity: details.popularity,
          adult: details.adult,
          genre_ids: JSON.stringify(genres.map((genre) => genre.id)),
          release_date: (details as TMDBMovieDetails).release_date,
          original_language: details.original_language,
          runtime: (details as TMDBMovieDetails).runtime,
          status: details.status,
        }
      : {
          title: (details as TMDBTvDetails).name,
          original_title: (details as TMDBTvDetails).original_name,
          overview: details.overview,
          poster_path: details.poster_path,
          backdrop_path: details.backdrop_path,
          vote_average: details.vote_average,
          vote_count: details.vote_count,
          popularity: details.popularity,
          adult: details.adult,
          genre_ids: JSON.stringify(genres.map((genre) => genre.id)),
          release_date: (details as TMDBTvDetails).first_air_date,
          original_language: details.original_language,
          runtime: (details as TMDBTvDetails).episode_run_time[0] ?? null,
          status: details.status,
        };

  await prisma.$transaction(async (tx) => {
    for (const genre of genres) {
      await tx.genre.upsert({
        where: { id: genre.id },
        update: { name: genre.name },
        create: { id: genre.id, name: genre.name },
      });
    }

    for (const person of people) {
      await tx.person.upsert({
        where: { id: person.id },
        update: {
          name: person.name,
          profilePath: person.profilePath,
          knownForDepartment: person.knownForDepartment,
        },
        create: person,
      });
    }

    await tx.mediaGenre.deleteMany({ where: { mediaSnapshotId } });
    await tx.mediaCredit.deleteMany({ where: { mediaSnapshotId } });

    if (genres.length > 0) {
      await tx.mediaGenre.createMany({
        data: genres.map((genre) => ({ mediaSnapshotId, genreId: genre.id })),
      });
    }

    if (uniqueCredits.length > 0) {
      await tx.mediaCredit.createMany({
        data: uniqueCredits.map((credit) => ({
          id: randomUUID(),
          mediaSnapshotId,
          personId: credit.person.id,
          creditKey: credit.creditKey,
          tmdbCreditId: credit.tmdbCreditId,
          kind: credit.kind,
          department: credit.department,
          job: credit.job,
          character: credit.character,
          billingOrder: credit.billingOrder,
          aggregateEpisodeCount: credit.aggregateEpisodeCount,
          metadataUpdatedAt: now,
        })),
      });
    }

    await tx.mediaSnapshot.update({
      where: { id: mediaSnapshotId },
      data: {
        ...snapshotUpdate,
        metadataStatus: 'READY',
        metadataVersion: METADATA_VERSION,
        detailsUpdatedAt: now,
        creditsUpdatedAt: now,
        lastMetadataAttemptAt: now,
        metadataFailureCode: null,
      },
    });
    await tx.mediaMetadataJob.delete({ where: { mediaSnapshotId } });
  });
};

const enrichClaimedJob = async (job: NonNullable<Awaited<ReturnType<typeof claimNextJob>>>) => {
  const { media } = job;

  try {
    const details = await fetchMediaDetails(media.media_type, media.media_id);
    const normalizedCredits =
      media.media_type === MediaType.movie
        ? normalizeMovieCredits(await fetchMovieCredits(media.media_id))
        : normalizeTvCredits(details as TMDBTvDetails, await fetchTvAggregateCredits(media.media_id));

    await persistMetadata(media.id, media.media_type, details, normalizedCredits);
  } catch (error) {
    const attempts = job.attempts + 1;
    const failureCode = getFailureCode(error);

    await prisma.$transaction(async (tx) => {
      await tx.mediaSnapshot.update({
        where: { id: media.id },
        data: {
          metadataStatus: media.metadataStatus === 'READY' ? 'READY' : attempts >= MAX_ATTEMPTS ? 'FAILED' : 'PENDING',
          lastMetadataAttemptAt: new Date(),
          metadataFailureCode: failureCode,
        },
      });

      if (attempts >= MAX_ATTEMPTS) {
        await tx.mediaMetadataJob.delete({ where: { id: job.id } });
      } else {
        await tx.mediaMetadataJob.update({
          where: { id: job.id },
          data: {
            attempts,
            availableAt: getRetryDate(attempts),
            lockedAt: null,
            lastError: getFailureMessage(error),
          },
        });
      }
    });
  }
};

export const processNextMediaMetadataJob = async () => {
  const job = await claimNextJob();
  if (!job) return false;

  await enrichClaimedJob(job);
  return true;
};

export const startMediaMetadataWorker = () => {
  let processing = false;

  const processAvailableJob = async () => {
    if (processing) return;
    processing = true;

    try {
      await processNextMediaMetadataJob();
    } catch (error) {
      console.error('Media metadata worker failed', error);
    } finally {
      processing = false;
    }
  };

  void processAvailableJob();
  const interval = setInterval(() => void processAvailableJob(), WORKER_INTERVAL_MS);
  interval.unref();

  return () => clearInterval(interval);
};
