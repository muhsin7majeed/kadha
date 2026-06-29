import { MediaType, Prisma, UserActivityType } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { createUserActivity } from '@/features/activity/activity.service';
import { upsertMediaSnapshot } from '@/features/media/media-snapshot.service';
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

const getTimestampUpdates = (flagUpdate: UserMediaFlagUpdate, timestamp: Date) => ({
  likedAt: typeof flagUpdate.liked === 'boolean' ? (flagUpdate.liked ? timestamp : null) : undefined,
  watchedAt: typeof flagUpdate.watched === 'boolean' ? (flagUpdate.watched ? timestamp : null) : undefined,
  watchlistAt: typeof flagUpdate.watchlist === 'boolean' ? (flagUpdate.watchlist ? timestamp : null) : undefined,
});

export async function upsertUserMedia(userId: string, payload: UserMediaPayload, flagUpdate: UserMediaFlagUpdate) {
  const mediaType = payload.media_type as MediaType;

  return prisma.$transaction(async (tx) => {
    await upsertMediaSnapshot(
      {
        ...payload,
        media_type: mediaType,
      },
      tx,
    );

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
    const now = new Date();
    const timestampUpdates = getTimestampUpdates(flagUpdate, now);

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
        ...timestampUpdates,
      },
      create: {
        userId,
        media_id: payload.media_id,
        media_type: mediaType,
        ...flagUpdate,
        ...timestampUpdates,
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
