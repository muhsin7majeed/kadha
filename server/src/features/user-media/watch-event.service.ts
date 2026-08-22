import { MediaType, Prisma, UserActivityType } from '@prisma/client';

import { createUserActivity } from '@/features/activity/activity.service';
import { upsertMediaSnapshot } from '@/features/media/media-snapshot.service';
import { badRequest, notFound } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { WatchEventCreatePayload, WatchEventUpdatePayload } from './user-media.schema';
import { formatWatchedOnForApi } from './user-media.serializer';

const normalizeNote = (value: string | null | undefined) => {
  if (typeof value !== 'string') return value ?? null;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeWatchedOn = (value: string | null | undefined) => {
  if (value === null) return null;
  if (value === undefined) return undefined;

  return new Date(`${value}T00:00:00.000Z`);
};

const hasKey = <Payload extends object, Key extends keyof Payload>(payload: Payload, key: Key) =>
  Object.prototype.hasOwnProperty.call(payload, key);

const parseMediaId = (value: string) => {
  const mediaId = Number(value);

  if (!Number.isInteger(mediaId) || mediaId <= 0) throw badRequest('Media ID must be a positive integer');
  return mediaId;
};

const parseMediaType = (value: string) => {
  if (value !== MediaType.movie && value !== MediaType.tv) throw badRequest('Invalid media type');
  return value;
};

const eventSelect = {
  id: true,
  media_id: true,
  media_type: true,
  seasonNumber: true,
  episodeNumber: true,
  episodeId: true,
  watchedAt: true,
  watchedOn: true,
  rating: true,
  note: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.WatchEventSelect;

type SelectedWatchEvent = Prisma.WatchEventGetPayload<{
  select: typeof eventSelect;
}>;

const serializeEvent = (event: SelectedWatchEvent) => ({
  ...event,
  watchedAt: event.watchedAt.toISOString(),
  watchedOn: formatWatchedOnForApi(event.watchedOn),
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
});

const buildHistoryResponse = (events: SelectedWatchEvent[]) => ({
  events: events.map(serializeEvent),
  watchCount: events.length,
  lastWatchedAt: events[0]?.watchedAt.toISOString() ?? null,
  lastWatchedOn: formatWatchedOnForApi(events[0]?.watchedOn),
});

const findMediaEvents = (userId: string, mediaId: number, mediaType: MediaType) =>
  prisma.watchEvent.findMany({
    where: { userId, media_id: mediaId, media_type: mediaType },
    orderBy: [{ watchedAt: 'desc' }, { createdAt: 'desc' }],
    select: eventSelect,
  });

export async function listWatchEvents(userId: string, mediaIdValue: string, mediaTypeValue: string) {
  const mediaId = parseMediaId(mediaIdValue);
  const mediaType = parseMediaType(mediaTypeValue);

  return buildHistoryResponse(await findMediaEvents(userId, mediaId, mediaType));
}

export async function createWatchEvent(userId: string, payload: WatchEventCreatePayload) {
  const mediaType = payload.media_type as MediaType;
  const watchedOn = normalizeWatchedOn(payload.watchedOn);
  const note = normalizeNote(payload.note);

  await prisma.$transaction(async (tx) => {
    await upsertMediaSnapshot({ ...payload, media_type: mediaType }, tx);

    if (payload.clientRequestId) {
      const existing = await tx.watchEvent.findUnique({
        where: {
          userId_clientRequestId: {
            userId,
            clientRequestId: payload.clientRequestId,
          },
        },
        select: { id: true, media_id: true, media_type: true },
      });

      if (existing) {
        if (existing.media_id !== payload.media_id || existing.media_type !== mediaType) {
          throw badRequest('Client request ID is already used for another title');
        }
        return;
      }
    }

    const now = new Date();
    const isTitleEvent = payload.seasonNumber == null && payload.episodeNumber == null;
    const existingUserMedia = await tx.userMedia.findUnique({
      where: {
        userId_media_id_media_type: {
          userId,
          media_id: payload.media_id,
          media_type: mediaType,
        },
      },
      select: { watched: true },
    });

    await tx.userMedia.upsert({
      where: {
        userId_media_id_media_type: {
          userId,
          media_id: payload.media_id,
          media_type: mediaType,
        },
      },
      update: {
        watchlist: false,
        watchlistAt: null,
        ...(isTitleEvent
          ? {
              watched: true,
              watchedAt: now,
              watchedOn,
              watchedNote: note,
              ...(hasKey(payload, 'rating')
                ? {
                    rating: payload.rating ?? null,
                    ratedAt: payload.rating == null ? null : now,
                  }
                : {}),
            }
          : {}),
      },
      create: {
        userId,
        media_id: payload.media_id,
        media_type: mediaType,
        watchlist: false,
        watched: isTitleEvent,
        watchedAt: isTitleEvent ? now : null,
        watchedOn: isTitleEvent ? watchedOn : null,
        watchedNote: isTitleEvent ? note : null,
        rating: isTitleEvent ? (payload.rating ?? null) : null,
        ratedAt: isTitleEvent && payload.rating != null ? now : null,
      },
    });

    await tx.watchEvent.create({
      data: {
        userId,
        media_id: payload.media_id,
        media_type: mediaType,
        seasonNumber: payload.seasonNumber ?? null,
        episodeNumber: payload.episodeNumber ?? null,
        episodeId: payload.episodeId ?? null,
        clientRequestId: payload.clientRequestId,
        watchedOn,
        rating: isTitleEvent ? null : (payload.rating ?? null),
        note,
      },
    });

    if (isTitleEvent && !existingUserMedia?.watched) {
      await createUserActivity(
        {
          userId,
          type: UserActivityType.MEDIA_WATCHED,
          media_id: payload.media_id,
          media_type: mediaType,
          metadata: { title: payload.title, poster_path: payload.poster_path },
        },
        tx,
      );
    }
  });

  return listWatchEvents(userId, String(payload.media_id), mediaType);
}

export async function updateWatchEvent(userId: string, eventId: string, payload: WatchEventUpdatePayload) {
  const existing = await prisma.watchEvent.findFirst({
    where: { id: eventId, userId },
  });
  if (!existing) throw notFound('Watch event not found');

  const watchedOn = hasKey(payload, 'watchedOn') ? normalizeWatchedOn(payload.watchedOn) : undefined;
  const note = hasKey(payload, 'note') ? normalizeNote(payload.note) : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.watchEvent.update({
      where: { id: eventId },
      data: {
        watchedOn,
        note,
        ...(existing.seasonNumber !== null && hasKey(payload, 'rating') ? { rating: payload.rating ?? null } : {}),
      },
    });

    if (existing.seasonNumber === null && existing.episodeNumber === null) {
      const latest = await tx.watchEvent.findFirst({
        where: {
          userId,
          media_id: existing.media_id,
          media_type: existing.media_type,
          seasonNumber: null,
          episodeNumber: null,
        },
        select: { id: true },
        orderBy: [{ watchedAt: 'desc' }, { createdAt: 'desc' }],
      });
      const isLatest = latest?.id === eventId;

      if (isLatest || hasKey(payload, 'rating')) {
        await tx.userMedia.update({
          where: {
            userId_media_id_media_type: {
              userId,
              media_id: existing.media_id,
              media_type: existing.media_type,
            },
          },
          data: {
            ...(isLatest ? { watchedOn, watchedNote: note } : {}),
            ...(hasKey(payload, 'rating')
              ? {
                  rating: payload.rating ?? null,
                  ratedAt: payload.rating == null ? null : new Date(),
                }
              : {}),
          },
        });
      }
    }
  });

  return listWatchEvents(userId, String(existing.media_id), existing.media_type);
}

export async function deleteWatchEvent(userId: string, eventId: string) {
  const existing = await prisma.watchEvent.findFirst({
    where: { id: eventId, userId },
  });
  if (!existing) throw notFound('Watch event not found');

  await prisma.$transaction(async (tx) => {
    await tx.watchEvent.delete({ where: { id: eventId } });

    if (existing.seasonNumber === null && existing.episodeNumber === null) {
      const latest = await tx.watchEvent.findFirst({
        where: {
          userId,
          media_id: existing.media_id,
          media_type: existing.media_type,
          seasonNumber: null,
          episodeNumber: null,
        },
        orderBy: [{ watchedAt: 'desc' }, { createdAt: 'desc' }],
      });

      await tx.userMedia.update({
        where: {
          userId_media_id_media_type: {
            userId,
            media_id: existing.media_id,
            media_type: existing.media_type,
          },
        },
        data: {
          watched: Boolean(latest),
          watchedAt: latest?.watchedAt ?? null,
          watchedOn: latest?.watchedOn ?? null,
          watchedNote: latest?.note ?? null,
        },
      });

      if (!latest) {
        await createUserActivity(
          {
            userId,
            type: UserActivityType.MEDIA_UNWATCHED,
            media_id: existing.media_id,
            media_type: existing.media_type,
          },
          tx,
        );
      }
    }
  });

  return listWatchEvents(userId, String(existing.media_id), existing.media_type);
}
