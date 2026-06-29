import { MediaType, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

type MediaSnapshotDelegate = Pick<typeof prisma, 'mediaSnapshot'> | Pick<Prisma.TransactionClient, 'mediaSnapshot'>;

export interface MediaSnapshotPayload {
  media_id: number;
  media_type: MediaType | 'movie' | 'tv';
  title?: string | null;
  original_title?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number | null;
  vote_count?: number | null;
  popularity?: number | null;
  adult?: boolean | null;
  genre_ids?: number[] | null;
  release_date?: string | null;
  original_language?: string | null;
  runtime?: number | null;
  status?: string | null;
}

const serializeGenreIds = (genreIds: number[] | null | undefined) => {
  if (genreIds === undefined) return undefined;
  return genreIds ? JSON.stringify(genreIds) : null;
};

const getSnapshotData = (payload: MediaSnapshotPayload) => ({
  title: payload.title,
  original_title: payload.original_title,
  overview: payload.overview,
  poster_path: payload.poster_path,
  backdrop_path: payload.backdrop_path,
  vote_average: payload.vote_average,
  vote_count: payload.vote_count,
  popularity: payload.popularity,
  adult: payload.adult,
  genre_ids: serializeGenreIds(payload.genre_ids),
  release_date: payload.release_date,
  original_language: payload.original_language,
  runtime: payload.runtime,
  status: payload.status,
});

export const upsertMediaSnapshot = (payload: MediaSnapshotPayload, db: MediaSnapshotDelegate = prisma) => {
  const mediaType = payload.media_type as MediaType;
  const snapshotData = getSnapshotData(payload);

  return db.mediaSnapshot.upsert({
    where: {
      media_id_media_type: {
        media_id: payload.media_id,
        media_type: mediaType,
      },
    },
    update: snapshotData,
    create: {
      media_id: payload.media_id,
      media_type: mediaType,
      ...snapshotData,
    },
  });
};

export const parseSnapshotGenreIds = (genreIds: string | number[] | null | undefined): number[] => {
  if (Array.isArray(genreIds)) return genreIds;
  if (!genreIds) return [];

  try {
    return JSON.parse(genreIds) as number[];
  } catch {
    return [];
  }
};

export const flattenMediaSnapshot = <
  T extends {
    media: {
      title: string | null;
      original_title: string | null;
      overview: string | null;
      poster_path: string | null;
      backdrop_path: string | null;
      vote_average: number | null;
      vote_count: number | null;
      popularity: number | null;
      adult: boolean | null;
      genre_ids: string | number[] | null;
      release_date: string | null;
      original_language: string | null;
      runtime: number | null;
      status: string | null;
    };
  },
>(
  item: T,
) => {
  const { media, ...rest } = item;

  return {
    ...rest,
    title: media.title,
    original_title: media.original_title,
    overview: media.overview,
    poster_path: media.poster_path,
    backdrop_path: media.backdrop_path,
    vote_average: media.vote_average,
    vote_count: media.vote_count,
    popularity: media.popularity,
    adult: media.adult,
    genre_ids: parseSnapshotGenreIds(media.genre_ids),
    release_date: media.release_date,
    original_language: media.original_language,
    runtime: media.runtime,
    status: media.status,
  };
};
