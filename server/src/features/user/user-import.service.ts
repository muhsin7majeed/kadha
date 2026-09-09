import { CollectionMemberRole, DataPrivacy, MediaType, Prisma, RecommendationFeedbackType } from '@prisma/client';

import { upsertMediaSnapshot } from '@/features/media/media-snapshot.service';
import { isSupportedWatchRegion, normalizeWatchRegion } from '@/constants/watch-regions';
import { prisma } from '@/lib/prisma';
import { navigationPreferencesSchema } from '@/features/navigation-preferences/navigation-preferences.schema';
import { normalizeNavigationPreferences } from '@/features/navigation-preferences/navigation-preferences.service';
import { ImportPayload } from './user-import.schema';
import { IMPORT_CATEGORIES, type ImportCategory } from './user-export.types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asArray = (value: unknown): Record<string, unknown>[] => (Array.isArray(value) ? value.filter(isRecord) : []);
const asString = (value: unknown) => (typeof value === 'string' ? value : null);
const asNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null);
const asBoolean = (value: unknown) => (typeof value === 'boolean' ? value : null);

const isMediaType = (value: unknown): value is MediaType => value === MediaType.movie || value === MediaType.tv;
const isPrivacy = (value: unknown): value is DataPrivacy =>
  value === DataPrivacy.ONLY_ME ||
  value === DataPrivacy.FRIENDS ||
  value === DataPrivacy.KADHA_USERS ||
  value === DataPrivacy.PUBLIC;
const isFeedbackType = (value: unknown): value is RecommendationFeedbackType =>
  value === RecommendationFeedbackType.MORE_LIKE_THIS ||
  value === RecommendationFeedbackType.LESS_LIKE_THIS ||
  value === RecommendationFeedbackType.HIDE;

const parseGenreIds = (value: unknown): number[] | null => {
  if (Array.isArray(value)) {
    return value.filter((item): item is number => typeof item === 'number' && Number.isInteger(item));
  }

  if (typeof value !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is number => typeof item === 'number' && Number.isInteger(item))
      : null;
  } catch {
    return null;
  }
};

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getExportData = (payload: ImportPayload) => payload.export;
const getData = (exportData: Record<string, unknown>) =>
  exportData.schemaVersion === 2 && isRecord(exportData.data) ? exportData.data : exportData;
const getAccount = (exportData: Record<string, unknown>) => {
  const data = getData(exportData);
  const account = data.accountPreferences ?? data.account;
  return isRecord(account) ? account : {};
};
const getSourceAccountId = (exportData: Record<string, unknown>) => asString(getAccount(exportData).id) ?? 'unknown';

const mediaSnapshotMaps = new WeakMap<Record<string, unknown>, Map<string, Record<string, unknown>>>();

const getMediaSnapshotMap = (exportData: Record<string, unknown>) => {
  const cached = mediaSnapshotMaps.get(exportData);
  if (cached) return cached;

  const snapshots = new Map(
    asArray(getData(exportData).mediaSnapshots).flatMap((snapshot) => {
      const mediaId = asNumber(snapshot.media_id);
      const mediaType = snapshot.media_type;
      return mediaId && Number.isInteger(mediaId) && isMediaType(mediaType)
        ? [[`${mediaType}:${mediaId}`, snapshot] as const]
        : [];
    }),
  );
  mediaSnapshotMaps.set(exportData, snapshots);
  return snapshots;
};

const withMediaSnapshot = (item: Record<string, unknown>, exportData: Record<string, unknown>) => {
  if (isRecord(item.media)) return item;
  const mediaId = asNumber(item.media_id);
  const mediaType = item.media_type;
  const snapshot =
    mediaId && isMediaType(mediaType) ? getMediaSnapshotMap(exportData).get(`${mediaType}:${mediaId}`) : undefined;
  return snapshot ? { ...item, media: snapshot } : item;
};

const getMediaSnapshotPayload = (item: Record<string, unknown>) => {
  const media = isRecord(item.media) ? item.media : item;
  const mediaId = asNumber(item.media_id ?? media.media_id);
  const mediaType = item.media_type ?? media.media_type;

  if (!mediaId || !Number.isInteger(mediaId) || !isMediaType(mediaType)) {
    return null;
  }

  return {
    media_id: mediaId,
    media_type: mediaType,
    title: asString(media.title),
    original_title: asString(media.original_title),
    overview: asString(media.overview),
    poster_path: asString(media.poster_path),
    backdrop_path: asString(media.backdrop_path),
    vote_average: asNumber(media.vote_average),
    vote_count: asNumber(media.vote_count),
    popularity: asNumber(media.popularity),
    adult: asBoolean(media.adult),
    genre_ids: parseGenreIds(media.genre_ids),
    release_date: asString(media.release_date),
    original_language: asString(media.original_language),
    runtime: asNumber(media.runtime),
    status: asString(media.status),
  };
};

const getValidMediaItems = (exportData: Record<string, unknown>) =>
  asArray(getData(exportData).mediaTracking ?? getData(exportData).media)
    .map((item) => withMediaSnapshot(item, exportData))
    .filter((item) => getMediaSnapshotPayload(item));

const getValidWatchEvents = (exportData: Record<string, unknown>) =>
  asArray(getData(exportData).watchEvents)
    .map((event) => withMediaSnapshot(event, exportData))
    .filter((event) => {
      const mediaId = asNumber(event.media_id);
      return Boolean(mediaId && Number.isInteger(mediaId) && isMediaType(event.media_type));
    });

const getOwnedCollections = (exportData: Record<string, unknown>) =>
  asArray(getData(exportData).collections).filter((collection) => asString(collection.name));

const getCollectionItems = (collection: Record<string, unknown>, exportData: Record<string, unknown>) =>
  asArray(collection.items)
    .map((item) => withMediaSnapshot(item, exportData))
    .filter((item) => getMediaSnapshotPayload(item));

const getValidRecommendationFeedback = (exportData: Record<string, unknown>) =>
  asArray(getData(exportData).recommendationFeedback)
    .map((feedback) => withMediaSnapshot(feedback, exportData))
    .filter((feedback) => {
      const mediaId = asNumber(feedback.media_id);
      return Boolean(
        mediaId && Number.isInteger(mediaId) && isMediaType(feedback.media_type) && isFeedbackType(feedback.type),
      );
    });

const getImportableNavigationPreferences = (exportData: Record<string, unknown>) => {
  const parsed = navigationPreferencesSchema.safeParse(getAccount(exportData).navigation);
  return parsed.success ? normalizeNavigationPreferences(parsed.data, false) : null;
};

const hasImportableAccountPreferences = (exportData: Record<string, unknown>) => {
  const account = getAccount(exportData);
  const watchRegion = asString(account.watchRegion);

  return (
    isPrivacy(account.profilePrivacy) ||
    isPrivacy(account.watchedPrivacy) ||
    isPrivacy(account.likedPrivacy) ||
    isPrivacy(account.watchlistPrivacy) ||
    Boolean(watchRegion && isSupportedWatchRegion(normalizeWatchRegion(watchRegion))) ||
    Boolean(getImportableNavigationPreferences(exportData))
  );
};

const getAvailableImportCategories = (exportData: Record<string, unknown>): ImportCategory[] => {
  const data = getData(exportData);
  return IMPORT_CATEGORIES.filter((category) => {
    if (category === 'accountPreferences') return hasImportableAccountPreferences(exportData);
    if (category === 'mediaTracking') return getValidMediaItems(exportData).length > 0;
    if (category === 'watchHistory') return getValidWatchEvents(exportData).length > 0;
    if (category === 'collections') return getOwnedCollections(exportData).length > 0;
    if (category === 'recommendationSettings') return isRecord(data.recommendationSettings);
    return getValidRecommendationFeedback(exportData).length > 0;
  });
};

export const previewUserImport = async (targetUserId: string, payload: ImportPayload) => {
  const exportData = getExportData(payload);
  const data = getData(exportData);
  const account = getAccount(exportData);
  const media = getValidMediaItems(exportData);
  const watchEvents = getValidWatchEvents(exportData);
  const collections = getOwnedCollections(exportData);
  const recommendationFeedback = getValidRecommendationFeedback(exportData);
  const existingCollectionNames = await prisma.collection.findMany({
    where: {
      userId: targetUserId,
      name: {
        in: collections.map((collection) => asString(collection.name)).filter((name): name is string => Boolean(name)),
      },
    },
    select: { name: true },
  });

  return {
    source: {
      username: asString(account.username),
      exportedAt: asString(exportData.exportedAt),
      schemaVersion: asNumber(exportData.schemaVersion) ?? null,
    },
    importable: {
      accountPreferences: hasImportableAccountPreferences(exportData) ? 1 : 0,
      media: media.length,
      watchEvents: watchEvents.length,
      collections: collections.length,
      collectionItems: collections.reduce(
        (count, collection) => count + getCollectionItems(collection, exportData).length,
        0,
      ),
      recommendationSettings: isRecord(data.recommendationSettings) ? 1 : 0,
      recommendationFeedback: recommendationFeedback.length,
    },
    availableCategories: getAvailableImportCategories(exportData),
    unsupported: {
      friendships: asArray(data.friendships).length,
      notifications: asArray(data.notifications).length,
      collectionMemberships: asArray(data.collectionMemberships).length,
      collectionInvites: asArray(data.collectionInvites).length,
      activity: asArray(data.activity).length,
    },
    conflicts: {
      collections: existingCollectionNames.length,
    },
    warnings: [
      'Imported records will belong to the current account.',
      'Watch history can move between accounts. Friendships are less portable.',
    ],
  };
};

const upsertImportedUserMedia = async (
  tx: Prisma.TransactionClient,
  userId: string,
  item: Record<string, unknown>,
  overwriteDetails: boolean,
) => {
  const media = getMediaSnapshotPayload(item);

  if (!media) return 'skipped' as const;

  await upsertMediaSnapshot(media, tx);

  const existing = await tx.userMedia.findUnique({
    where: {
      userId_media_id_media_type: {
        userId,
        media_id: media.media_id,
        media_type: media.media_type,
      },
    },
  });
  const data = {
    liked: Boolean(existing?.liked || item.liked === true),
    watched: Boolean(existing?.watched || item.watched === true),
    watchlist: Boolean(existing?.watchlist || item.watchlist === true),
    likedAt: overwriteDetails || !existing?.likedAt ? (parseDate(item.likedAt) ?? existing?.likedAt) : existing.likedAt,
    watchedAt:
      overwriteDetails || !existing?.watchedAt
        ? (parseDate(item.watchedAt) ?? existing?.watchedAt)
        : existing.watchedAt,
    watchlistAt:
      overwriteDetails || !existing?.watchlistAt
        ? (parseDate(item.watchlistAt) ?? existing?.watchlistAt)
        : existing.watchlistAt,
    rating:
      overwriteDetails || existing?.rating === null || existing?.rating === undefined
        ? (asNumber(item.rating) ?? existing?.rating)
        : existing.rating,
    ratedAt: overwriteDetails || !existing?.ratedAt ? (parseDate(item.ratedAt) ?? existing?.ratedAt) : existing.ratedAt,
    watchedOn:
      overwriteDetails || !existing?.watchedOn
        ? (parseDate(item.watchedOn) ?? existing?.watchedOn)
        : existing.watchedOn,
    likedNote:
      overwriteDetails || !existing?.likedNote ? (asString(item.likedNote) ?? existing?.likedNote) : existing.likedNote,
    watchedNote:
      overwriteDetails || !existing?.watchedNote
        ? (asString(item.watchedNote) ?? existing?.watchedNote)
        : existing.watchedNote,
    watchlistNote:
      overwriteDetails || !existing?.watchlistNote
        ? (asString(item.watchlistNote) ?? existing?.watchlistNote)
        : existing.watchlistNote,
  };

  if (existing) {
    await tx.userMedia.update({ where: { id: existing.id }, data });
    return 'updated' as const;
  }

  await tx.userMedia.create({
    data: {
      userId,
      media_id: media.media_id,
      media_type: media.media_type,
      ...data,
    },
  });
  return 'created' as const;
};

const importWatchEvent = async (
  tx: Prisma.TransactionClient,
  userId: string,
  sourceAccountId: string,
  event: Record<string, unknown>,
) => {
  const mediaId = asNumber(event.media_id);
  const mediaType = event.media_type;
  const sourceEventId = asString(event.eventId ?? event.id);

  if (!mediaId || !Number.isInteger(mediaId) || !isMediaType(mediaType) || !sourceEventId) {
    return 'skipped' as const;
  }

  const media = getMediaSnapshotPayload(event);
  if (media) await upsertMediaSnapshot(media, tx);

  const clientRequestId = `import:${sourceAccountId}:watch-event:${sourceEventId}`;
  const existing = await tx.watchEvent.findUnique({
    where: {
      userId_clientRequestId: {
        userId,
        clientRequestId,
      },
    },
  });

  if (existing) return 'skipped' as const;

  await tx.watchEvent.create({
    data: {
      userId,
      media_id: mediaId,
      media_type: mediaType,
      seasonNumber: asNumber(event.seasonNumber),
      episodeNumber: asNumber(event.episodeNumber),
      episodeId: asNumber(event.episodeId),
      clientRequestId,
      watchedAt: parseDate(event.watchedAt) ?? new Date(),
      watchedOn: parseDate(event.watchedOn),
      rating: asNumber(event.rating),
      note: asString(event.note),
    },
  });

  return 'created' as const;
};

const importCollection = async (
  tx: Prisma.TransactionClient,
  userId: string,
  collection: Record<string, unknown>,
  exportData: Record<string, unknown>,
) => {
  const name = asString(collection.name);
  if (!name) return { collectionCreated: false, itemCreatedCount: 0 };

  const existing = await tx.collection.findFirst({ where: { userId, name } });
  const targetCollection =
    existing ??
    (await tx.collection.create({
      data: {
        userId,
        name,
        description: asString(collection.description),
        privacy: isPrivacy(collection.privacy) ? collection.privacy : DataPrivacy.ONLY_ME,
      },
    }));
  let itemCreatedCount = 0;

  for (const item of getCollectionItems(collection, exportData)) {
    const media = getMediaSnapshotPayload(item);
    if (!media) continue;

    await upsertMediaSnapshot(media, tx);
    const existingItem = await tx.collectionItem.findUnique({
      where: {
        collectionId_media_id_media_type: {
          collectionId: targetCollection.id,
          media_id: media.media_id,
          media_type: media.media_type,
        },
      },
    });

    if (existingItem) continue;

    await tx.collectionItem.create({
      data: {
        collectionId: targetCollection.id,
        media_id: media.media_id,
        media_type: media.media_type,
        addedByUserId: userId,
      },
    });
    itemCreatedCount += 1;
  }

  return { collectionCreated: !existing, itemCreatedCount };
};

const importRecommendationSettings = async (
  tx: Prisma.TransactionClient,
  userId: string,
  exportData: Record<string, unknown>,
  overwrite: boolean,
) => {
  const settings = getData(exportData).recommendationSettings;
  if (!isRecord(settings)) return 'skipped' as const;

  const existing = await tx.recommendationSettings.findUnique({
    where: { userId },
  });
  if (existing && !overwrite) return 'skipped' as const;

  await tx.recommendationSettings.upsert({
    where: { userId },
    update: {
      useLiked: asBoolean(settings.useLiked) ?? true,
      useRatings: asBoolean(settings.useRatings) ?? true,
      useWatched: asBoolean(settings.useWatched) ?? true,
      useRewatchHistory: asBoolean(settings.useRewatchHistory) ?? true,
      useWatchlist: asBoolean(settings.useWatchlist) ?? false,
      excludeWatched: asBoolean(settings.excludeWatched) ?? true,
    },
    create: {
      userId,
      useLiked: asBoolean(settings.useLiked) ?? true,
      useRatings: asBoolean(settings.useRatings) ?? true,
      useWatched: asBoolean(settings.useWatched) ?? true,
      useRewatchHistory: asBoolean(settings.useRewatchHistory) ?? true,
      useWatchlist: asBoolean(settings.useWatchlist) ?? false,
      excludeWatched: asBoolean(settings.excludeWatched) ?? true,
    },
  });

  return existing ? ('updated' as const) : ('created' as const);
};

const importAccountPreferences = async (
  tx: Prisma.TransactionClient,
  userId: string,
  exportData: Record<string, unknown>,
) => {
  const account = getAccount(exportData);
  const profilePrivacy = account.profilePrivacy;
  const watchedPrivacy = account.watchedPrivacy;
  const likedPrivacy = account.likedPrivacy;
  const watchlistPrivacy = account.watchlistPrivacy;
  const watchRegion = asString(account.watchRegion);
  const normalizedWatchRegion = watchRegion ? normalizeWatchRegion(watchRegion) : null;

  const navigationPreferences = getImportableNavigationPreferences(exportData);

  await tx.user.update({
    where: { id: userId },
    data: {
      ...(isPrivacy(profilePrivacy) ? { profilePrivacy } : {}),
      ...(isPrivacy(watchedPrivacy) ? { watchedPrivacy } : {}),
      ...(isPrivacy(likedPrivacy) ? { likedPrivacy } : {}),
      ...(isPrivacy(watchlistPrivacy) ? { watchlistPrivacy } : {}),
      ...(normalizedWatchRegion && isSupportedWatchRegion(normalizedWatchRegion)
        ? { watchRegion: normalizedWatchRegion }
        : {}),
    },
  });

  if (navigationPreferences) {
    const config = JSON.stringify(navigationPreferences);
    await tx.navigationPreferences.upsert({
      where: { userId },
      update: { config },
      create: { userId, config },
    });
  }
};

const importRecommendationFeedback = async (
  tx: Prisma.TransactionClient,
  userId: string,
  feedback: Record<string, unknown>,
) => {
  const media = getMediaSnapshotPayload(feedback);
  const type = feedback.type;

  if (!media || !isFeedbackType(type)) return 'skipped' as const;

  await upsertMediaSnapshot(media, tx);
  const existing = await tx.recommendationFeedback.findUnique({
    where: {
      userId_media_id_media_type: {
        userId,
        media_id: media.media_id,
        media_type: media.media_type,
      },
    },
  });

  if (existing) return 'skipped' as const;

  await tx.recommendationFeedback.create({
    data: {
      userId,
      media_id: media.media_id,
      media_type: media.media_type,
      type,
    },
  });

  return 'created' as const;
};

export const applyUserImport = async (userId: string, payload: ImportPayload) => {
  const exportData = getExportData(payload);
  const data = getData(exportData);
  const sourceAccountId = getSourceAccountId(exportData);
  const selectedCategories = new Set<ImportCategory>(
    payload.options?.categories ??
      getAvailableImportCategories(exportData).filter((category) => category !== 'accountPreferences'),
  );
  const overwriteUserMediaDetails = payload.options?.overwriteUserMediaDetails ?? false;
  const overwriteRecommendationSettings = payload.options?.overwriteRecommendationSettings ?? true;

  return prisma.$transaction(async (tx) => {
    const summary = {
      created: {
        media: 0,
        watchEvents: 0,
        collections: 0,
        collectionItems: 0,
        recommendationSettings: 0,
        recommendationFeedback: 0,
      },
      updated: {
        accountPreferences: 0,
        media: 0,
        recommendationSettings: 0,
      },
      skipped: {
        accountPreferences: 0,
        media: 0,
        watchEvents: 0,
        collections: 0,
        collectionItems: 0,
        recommendationSettings: 0,
        recommendationFeedback: 0,
        friendships: asArray(data.friendships).length,
        notifications: asArray(data.notifications).length,
        collectionMemberships: asArray(data.collectionMemberships).length,
        collectionInvites: asArray(data.collectionInvites).length,
        activity: asArray(data.activity).length,
      },
    };

    if (selectedCategories.has('accountPreferences')) {
      await importAccountPreferences(tx, userId, exportData);
      summary.updated.accountPreferences = 1;
    } else if (hasImportableAccountPreferences(exportData)) {
      summary.skipped.accountPreferences = 1;
    }

    if (selectedCategories.has('mediaTracking')) {
      for (const item of getValidMediaItems(exportData)) {
        const result = await upsertImportedUserMedia(tx, userId, item, overwriteUserMediaDetails);
        summary[result === 'created' ? 'created' : result === 'updated' ? 'updated' : 'skipped'].media += 1;
      }
    } else {
      summary.skipped.media += getValidMediaItems(exportData).length;
    }

    if (selectedCategories.has('watchHistory')) {
      for (const event of getValidWatchEvents(exportData)) {
        const result = await importWatchEvent(tx, userId, sourceAccountId, event);
        summary[result === 'created' ? 'created' : 'skipped'].watchEvents += 1;
      }
    } else {
      summary.skipped.watchEvents += getValidWatchEvents(exportData).length;
    }

    if (selectedCategories.has('collections')) {
      for (const collection of getOwnedCollections(exportData)) {
        const result = await importCollection(tx, userId, collection, exportData);
        if (result.collectionCreated) {
          summary.created.collections += 1;
        } else {
          summary.skipped.collections += 1;
        }
        summary.created.collectionItems += result.itemCreatedCount;
      }
    } else {
      summary.skipped.collections += getOwnedCollections(exportData).length;
      summary.skipped.collectionItems += getOwnedCollections(exportData).reduce(
        (count, collection) => count + getCollectionItems(collection, exportData).length,
        0,
      );
    }

    if (selectedCategories.has('recommendationSettings')) {
      const settingsResult = await importRecommendationSettings(
        tx,
        userId,
        exportData,
        overwriteRecommendationSettings,
      );
      summary[
        settingsResult === 'created' ? 'created' : settingsResult === 'updated' ? 'updated' : 'skipped'
      ].recommendationSettings += 1;
    } else if (isRecord(data.recommendationSettings)) {
      summary.skipped.recommendationSettings += 1;
    }

    if (selectedCategories.has('recommendationFeedback')) {
      for (const feedback of getValidRecommendationFeedback(exportData)) {
        const result = await importRecommendationFeedback(tx, userId, feedback);
        summary[result === 'created' ? 'created' : 'skipped'].recommendationFeedback += 1;
      }
    } else {
      summary.skipped.recommendationFeedback += getValidRecommendationFeedback(exportData).length;
    }

    return summary;
  });
};
