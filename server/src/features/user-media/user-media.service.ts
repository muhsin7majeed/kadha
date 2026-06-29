import { MediaType, Prisma, UserActivityType } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { createUserActivity } from '@/features/activity/activity.service';
import { UserMediaPayload } from './user-media.schema';

type UserMediaFlagUpdate = Pick<Prisma.UserMediaCreateInput, 'liked' | 'watched' | 'watchlist'>;
type UserMediaFlag = keyof UserMediaFlagUpdate;

const activityTypeByFlagValue = {
  liked: {
    true: UserActivityType.MEDIA_LIKED,
    false: UserActivityType.MEDIA_UNLIKED,
  },
  watched: {
    true: UserActivityType.MEDIA_WATCHED,
    false: UserActivityType.MEDIA_UNWATCHED,
  },
  watchlist: {
    true: UserActivityType.MEDIA_WATCHLISTED,
    false: UserActivityType.MEDIA_REMOVED_FROM_WATCHLIST,
  },
} as const satisfies Record<UserMediaFlag, Record<'true' | 'false', UserActivityType>>;

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

  return prisma.$transaction(async (tx) => {
    const existingMedia = await tx.userMedia.findUnique({
      where: {
        userId_media_id_media_type: {
          userId,
          media_id: payload.media_id,
          media_type: mediaType,
        },
      },
      select: {
        liked: true,
        watched: true,
        watchlist: true,
      },
    });

    const updatedMedia = await tx.userMedia.upsert({
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

    const activityEntries = Object.entries(flagUpdate).filter(
      (entry): entry is [UserMediaFlag, boolean] => typeof entry[1] === 'boolean',
    );

    for (const [flag, nextValue] of activityEntries) {
      const previousValue = existingMedia?.[flag] ?? false;

      if (previousValue !== nextValue) {
        await createUserActivity(
          {
            userId,
            type: activityTypeByFlagValue[flag][String(nextValue) as 'true' | 'false'],
            media_id: payload.media_id,
            media_type: mediaType,
            metadata: {
              title: payload.title,
              poster_path: payload.poster_path,
            },
          },
          tx,
        );
      }
    }

    return updatedMedia;
  });
}
