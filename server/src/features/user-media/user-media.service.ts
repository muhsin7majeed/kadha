import { MediaType, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { UserMediaPayload } from './user-media.schema';

type UserMediaFlagUpdate = Pick<Prisma.UserMediaCreateInput, 'liked' | 'watched' | 'watchlist'>;

function getMediaData(payload: UserMediaPayload) {
  return {
    title: payload.title,
    poster_path: payload.poster_path,
    vote_average: payload.vote_average,
    vote_count: payload.vote_count,
    adult: payload.adult,
    genre_ids: payload.genre_ids ? JSON.stringify(payload.genre_ids) : null,
    release_date: payload.release_date,
  };
}

export async function upsertUserMedia(userId: string, payload: UserMediaPayload, flagUpdate: UserMediaFlagUpdate) {
  const mediaType = payload.media_type as MediaType;
  const mediaData = getMediaData(payload);

  return prisma.userMedia.upsert({
    where: {
      userId_media_id_media_type: {
        userId,
        media_id: payload.media_id,
        media_type: mediaType,
      },
    },
    update: {
      ...flagUpdate,
      ...mediaData,
    },
    create: {
      userId,
      media_id: payload.media_id,
      media_type: mediaType,
      ...flagUpdate,
      ...mediaData,
    },
  });
}
