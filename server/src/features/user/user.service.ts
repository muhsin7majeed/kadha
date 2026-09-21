import { Prisma, UserActivityType } from '@prisma/client';

import { createUserActivity } from '@/features/activity/activity.service';
import { flattenMediaSnapshot } from '@/features/media/media-snapshot.service';
import {
  formatUserMediaTrackingDetails,
  stripPrivateUserMediaTrackingDetails,
} from '@/features/user-media/user-media.serializer';
import { getTvProgress } from '@/features/user-media/tv-progress.service';
import { normalizeWatchRegion } from '@/constants/watch-regions';
import { DataPrivacy, LockedReason, ResourceAccessResponse } from '@/types/common';
import { enrichUsersWithFriendship, getViewerRelationship } from '@/lib/friendship-utils';
import { createPaginationMeta } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { canViewByPrivacy, getLockedReason, isBlockingRelationship } from '@/lib/privacy-utils';
import { UserMediaQuery } from './user-media-query.schema';

type UserMediaFlag = 'watchlist' | 'liked' | 'watched';
type UserMediaListQuery = Pick<UserMediaQuery, 'page' | 'limit'> & Partial<UserMediaQuery>;
export type InProgressTvSort = 'recent' | 'next';

const TV_PROGRESS_CONCURRENCY = 5;

const viewableResource = <T>(data: T): ResourceAccessResponse<T> => ({
  data,
  access: {
    canView: true,
  },
});

export const lockedResource = (lockedReason: LockedReason): ResourceAccessResponse<[]> => ({
  data: [],
  access: {
    canView: false,
    lockedReason,
  },
});

const privacyFieldByFlag = {
  watched: 'watchedPrivacy',
  liked: 'likedPrivacy',
  watchlist: 'watchlistPrivacy',
} as const satisfies Record<UserMediaFlag, 'watchedPrivacy' | 'likedPrivacy' | 'watchlistPrivacy'>;

const usernameAlreadyExists = {
  fieldErrors: { username: 'Username already exists' },
};

const getSqlSortedPageIds = async (
  tx: Prisma.TransactionClient,
  id: string,
  flag: UserMediaFlag,
  query: UserMediaListQuery,
) => {
  const conditions: Prisma.Sql[] = [Prisma.sql`um."userId" = ${id}`, Prisma.sql`${Prisma.raw(`um."${flag}"`)} = 1`];

  if (query.mediaType) conditions.push(Prisma.sql`um."media_type" = ${query.mediaType}`);
  if (query.query) {
    const pattern = `%${query.query}%`;
    conditions.push(Prisma.sql`(m."title" LIKE ${pattern} OR m."original_title" LIKE ${pattern})`);
  }
  if (query.yearFrom !== undefined) conditions.push(Prisma.sql`m."release_date" >= ${`${query.yearFrom}-01-01`}`);
  if (query.yearTo !== undefined) conditions.push(Prisma.sql`m."release_date" <= ${`${query.yearTo}-12-31`}`);
  if (query.rating === 'rated') conditions.push(Prisma.sql`um."rating" IS NOT NULL`);
  if (query.rating === 'unrated') conditions.push(Prisma.sql`um."rating" IS NULL`);
  if (typeof query.rating === 'number') conditions.push(Prisma.sql`um."rating" >= ${query.rating}`);
  query.genres?.forEach((genreId) => {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "media_genres" mg
      WHERE mg."mediaSnapshotId" = m."id" AND mg."genreId" = ${genreId}
    )`);
  });

  const valueColumn = query.sort === 'title' ? Prisma.raw('m."title"') : Prisma.raw('m."release_date"');
  const direction = Prisma.raw(query.order === 'asc' ? 'ASC' : 'DESC');
  const offset = (query.page - 1) * query.limit;

  return tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT um."id"
    FROM "user_media" um
    INNER JOIN "media_snapshots" m
      ON m."media_id" = um."media_id" AND m."media_type" = um."media_type"
    WHERE ${Prisma.join(conditions, ' AND ')}
    ORDER BY
      CASE WHEN NULLIF(TRIM(${valueColumn}), '') IS NULL THEN 1 ELSE 0 END ASC,
      ${valueColumn} COLLATE NOCASE ${direction},
      um."media_type" ASC,
      um."media_id" ASC
    LIMIT ${query.limit} OFFSET ${offset}
  `);
};

export async function getCurrentUser(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      role: true,
      profilePrivacy: true,
      watchedPrivacy: true,
      likedPrivacy: true,
      watchlistPrivacy: true,
      watchRegion: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateCurrentUser(
  id: string,
  username: string,
  profilePrivacy: DataPrivacy,
  watchedPrivacy: DataPrivacy,
  likedPrivacy: DataPrivacy,
  watchlistPrivacy: DataPrivacy,
  watchRegion: string,
) {
  const currentUser = await prisma.user.findUnique({
    where: { id },
    select: {
      username: true,
      profilePrivacy: true,
      watchedPrivacy: true,
      likedPrivacy: true,
      watchlistPrivacy: true,
      watchRegion: true,
    },
  });

  const existingUser = await prisma.user.findFirst({
    where: {
      username,
      id: {
        not: id,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return usernameAlreadyExists;
  }

  try {
    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: {
          username,
          profilePrivacy,
          watchedPrivacy,
          likedPrivacy,
          watchlistPrivacy,
          watchRegion: normalizeWatchRegion(watchRegion),
        },
      });

      if (
        currentUser &&
        (currentUser.username !== user.username ||
          currentUser.profilePrivacy !== user.profilePrivacy ||
          currentUser.watchedPrivacy !== user.watchedPrivacy ||
          currentUser.likedPrivacy !== user.likedPrivacy ||
          currentUser.watchlistPrivacy !== user.watchlistPrivacy ||
          currentUser.watchRegion !== user.watchRegion)
      ) {
        await createUserActivity(
          {
            userId: id,
            type: UserActivityType.PROFILE_UPDATED,
            metadata: {
              title: user.username,
            },
          },
          tx,
        );
      }

      return user;
    });

    return {
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        profilePrivacy: updatedUser.profilePrivacy,
        watchedPrivacy: updatedUser.watchedPrivacy,
        likedPrivacy: updatedUser.likedPrivacy,
        watchlistPrivacy: updatedUser.watchlistPrivacy,
        watchRegion: updatedUser.watchRegion,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    };
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return usernameAlreadyExists;
    }

    throw error;
  }
}

export async function searchUsersByUsername(currentUserId: string, query: string, page: number, limit: number) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      data: [],
      pagination: createPaginationMeta(1, limit, 0),
    };
  }

  const where = {
    username: {
      contains: normalizedQuery,
    },
    id: {
      not: currentUserId,
    },
    NOT: [
      {
        sentFriendRequests: {
          some: {
            receiverId: currentUserId,
            status: 'BLOCKED' as const,
          },
        },
      },
      {
        receivedFriendRequests: {
          some: {
            senderId: currentUserId,
            status: 'BLOCKED' as const,
          },
        },
      },
    ],
  };
  const skip = (page - 1) * limit;
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        username: 'asc',
      },
      select: {
        id: true,
        username: true,
        profilePrivacy: true,
        watchedPrivacy: true,
        likedPrivacy: true,
        watchlistPrivacy: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: await enrichUsersWithFriendship(currentUserId, users),
    pagination: createPaginationMeta(page, limit, total),
  };
}

export async function getUserProfileByUsername(viewerId: string | undefined, username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      profilePrivacy: true,
      watchedPrivacy: true,
      likedPrivacy: true,
      watchlistPrivacy: true,
    },
  });

  if (!user) {
    return null;
  }

  const relationship = viewerId ? await getViewerRelationship(viewerId, user.id) : null;

  if (relationship && isBlockingRelationship(relationship.friendshipStatus)) {
    return { blocked: true as const };
  }

  const areFriends = relationship?.friendshipStatus === 'ACCEPTED';
  const canViewProfile = canViewByPrivacy({
    viewerId,
    ownerId: user.id,
    privacy: user.profilePrivacy as DataPrivacy,
    areFriends,
  });
  const sections = {
    watched: canViewByPrivacy({
      viewerId,
      ownerId: user.id,
      privacy: user.watchedPrivacy as DataPrivacy,
      areFriends,
    }),
    liked: canViewByPrivacy({
      viewerId,
      ownerId: user.id,
      privacy: user.likedPrivacy as DataPrivacy,
      areFriends,
    }),
    watchlist: canViewByPrivacy({
      viewerId,
      ownerId: user.id,
      privacy: user.watchlistPrivacy as DataPrivacy,
      areFriends,
    }),
    collections: true,
  };

  return {
    id: user.id,
    username: user.username,
    profilePrivacy: user.profilePrivacy,
    friendshipStatus: relationship?.friendshipStatus ?? 'NONE',
    isRequestSender: relationship?.isRequestSender ?? false,
    access: {
      canView: canViewProfile,
      ...(canViewProfile
        ? {}
        : {
            lockedReason: getLockedReason(user.profilePrivacy as DataPrivacy, viewerId),
          }),
    },
    sections,
  };
}

export async function getUserMediaByFlag(
  id: string,
  flag: UserMediaFlag,
  query: UserMediaListQuery,
  includePrivateTrackingDetails = true,
) {
  const baseWhere: Prisma.UserMediaWhereInput = {
    userId: id,
    [flag]: true,
  };
  const where: Prisma.UserMediaWhereInput = {
    ...baseWhere,
    ...(query.mediaType ? { media_type: query.mediaType } : {}),
    ...(query.query
      ? {
          media: {
            OR: [{ title: { contains: query.query } }, { original_title: { contains: query.query } }],
          },
        }
      : {}),
    ...(query.yearFrom !== undefined || query.yearTo !== undefined
      ? {
          media: {
            ...(query.query
              ? { OR: [{ title: { contains: query.query } }, { original_title: { contains: query.query } }] }
              : {}),
            release_date: {
              ...(query.yearFrom !== undefined ? { gte: `${query.yearFrom}-01-01` } : {}),
              ...(query.yearTo !== undefined ? { lte: `${query.yearTo}-12-31` } : {}),
            },
          },
        }
      : {}),
    ...(query.rating === 'rated'
      ? { rating: { not: null } }
      : query.rating === 'unrated'
        ? { rating: null }
        : typeof query.rating === 'number'
          ? { rating: { gte: query.rating } }
          : {}),
    ...(query.genres?.length
      ? {
          AND: query.genres.map((genreId) => ({
            media: { genres: { some: { genreId } } },
          })),
        }
      : {}),
  };
  const order = query.order ?? 'desc';
  const addedField = `${flag}At` as 'likedAt' | 'watchedAt' | 'watchlistAt';
  const primaryOrder: Prisma.UserMediaOrderByWithRelationInput =
    query.sort === 'title'
      ? { media: { title: { sort: order, nulls: 'last' } } }
      : query.sort === 'releaseDate'
        ? { media: { release_date: { sort: order, nulls: 'last' } } }
        : query.sort === 'runtime'
          ? { media: { runtime: { sort: order, nulls: 'last' } } }
          : query.sort === 'tmdbScore'
            ? { media: { vote_average: { sort: order, nulls: 'last' } } }
            : query.sort === 'rating'
              ? { rating: { sort: order, nulls: 'last' } }
              : { [addedField]: { sort: order, nulls: 'last' } };
  const orderBy: Prisma.UserMediaOrderByWithRelationInput[] = [primaryOrder];

  if (query.sort === 'tmdbScore') {
    orderBy.push({ media: { vote_count: { sort: 'desc', nulls: 'last' } } });
  }

  orderBy.push({ media_type: 'asc' }, { media_id: 'asc' });
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const usesSqlSort = query.sort === 'title' || query.sort === 'releaseDate';
  const [orderedData, total] = await prisma.$transaction(async (tx) => {
    const sqlSortedIds = usesSqlSort ? (await getSqlSortedPageIds(tx, id, flag, query)).map((item) => item.id) : null;
    const data = await tx.userMedia.findMany({
      where: sqlSortedIds ? { AND: [where, { id: { in: sqlSortedIds } }] } : where,
      skip: sqlSortedIds ? undefined : skip,
      take: sqlSortedIds ? undefined : limit,
      orderBy: sqlSortedIds ? undefined : orderBy,
      include: { media: true },
    });
    const count = await tx.userMedia.count({ where });

    if (!sqlSortedIds) return [data, count] as const;

    const sortedPosition = new Map(sqlSortedIds.map((rowId, index) => [rowId, index]));
    return [data.sort((first, second) => sortedPosition.get(first.id)! - sortedPosition.get(second.id)!), count] as const;
  });
  const facetRows = includePrivateTrackingDetails
    ? await prisma.userMedia.findMany({
        where: baseWhere,
        select: {
          media: {
            select: {
              release_date: true,
              genres: {
                select: { genre: { select: { id: true, name: true } } },
              },
            },
          },
        },
      })
    : [];
  const watchCounts = includePrivateTrackingDetails
    ? await prisma.watchEvent.groupBy({
        by: ['media_id', 'media_type'],
        where: {
          userId: id,
          media_id: { in: orderedData.map((item) => item.media_id) },
          seasonNumber: null,
          episodeNumber: null,
        },
        _count: { _all: true },
      })
    : [];
  const watchCountByMedia = new Map(
    watchCounts.map((item) => [`${item.media_type}:${item.media_id}`, item._count._all]),
  );

  const genres = new Map<number, string>();
  const years: number[] = [];

  facetRows.forEach(({ media }) => {
    media.genres.forEach(({ genre }) => genres.set(genre.id, genre.name));
    const year = Number(media.release_date?.slice(0, 4));
    if (Number.isInteger(year) && year > 0) years.push(year);
  });

  return {
    data: orderedData.map((item) => {
      const formatted = formatUserMediaTrackingDetails(flattenMediaSnapshot(item));

      return includePrivateTrackingDetails
        ? {
            ...formatted,
            watchCount: watchCountByMedia.get(`${item.media_type}:${item.media_id}`) ?? 0,
          }
        : stripPrivateUserMediaTrackingDetails(formatted);
    }),
    pagination: createPaginationMeta(page, limit, total),
    facets: {
      total: facetRows.length,
      genres: [...genres.entries()]
        .map(([genreId, name]) => ({ id: genreId, name }))
        .sort((first, second) => first.name.localeCompare(second.name)),
      years: {
        min: years.length > 0 ? Math.min(...years) : null,
        max: years.length > 0 ? Math.max(...years) : null,
      },
    },
  };
}

export async function getUserMediaByUsername(
  viewerId: string | undefined,
  username: string,
  flag: UserMediaFlag,
  page: number,
  limit: number,
) {
  const owner = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      watchedPrivacy: true,
      likedPrivacy: true,
      watchlistPrivacy: true,
    },
  });

  if (!owner) {
    return null;
  }

  const relationship = viewerId ? await getViewerRelationship(viewerId, owner.id) : null;

  if (relationship && isBlockingRelationship(relationship.friendshipStatus)) {
    return { blocked: true as const };
  }

  const privacy = owner[privacyFieldByFlag[flag]] as DataPrivacy;
  const canView = canViewByPrivacy({
    viewerId,
    ownerId: owner.id,
    privacy,
    areFriends: relationship?.friendshipStatus === 'ACCEPTED',
  });

  if (!canView) {
    return lockedResource(getLockedReason(privacy, viewerId));
  }

  const result = await getUserMediaByFlag(owner.id, flag, { page, limit }, false);

  return {
    ...viewableResource(result.data),
    pagination: result.pagination,
  };
}

export async function getUserCollectionsByUsername(viewerId: string | undefined, username: string) {
  const owner = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!owner) {
    return null;
  }

  const relationship = viewerId ? await getViewerRelationship(viewerId, owner.id) : null;

  if (relationship && isBlockingRelationship(relationship.friendshipStatus)) {
    return { blocked: true as const };
  }

  const isOwner = viewerId === owner.id;
  const isFriend = relationship?.friendshipStatus === 'ACCEPTED';

  const collections = await prisma.collection.findMany({
    where: {
      userId: owner.id,
      ...(isOwner
        ? {}
        : {
            OR: [
              { privacy: DataPrivacy.Public },
              ...(viewerId ? [{ privacy: DataPrivacy.KadhaUsers }] : []),
              ...(isFriend ? [{ privacy: DataPrivacy.Friends }] : []),
            ],
          }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      privacy: true,
      created_at: true,
      updated_at: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      updated_at: 'desc',
    },
  });

  return viewableResource(
    collections.map(({ _count, ...collection }) => ({
      ...collection,
      itemCount: _count.items,
    })),
  );
}

export const getCurrentUserMediaByFlag = async (id: string, flag: UserMediaFlag, query: UserMediaQuery) => {
  const result = await getUserMediaByFlag(id, flag, query);

  return {
    ...viewableResource(result.data),
    pagination: result.pagination,
    facets: result.facets,
  };
};

export async function getCurrentUserInProgressTv(id: string, page: number, limit: number, sort: InProgressTvSort) {
  const episodeWatches = await prisma.watchEvent.findMany({
    where: {
      userId: id,
      media_type: 'tv',
      seasonNumber: { not: null },
      episodeNumber: { not: null },
    },
    orderBy: {
      watchedAt: 'desc',
    },
    select: {
      media_id: true,
      watchedAt: true,
    },
  });
  const lastWatchedByMedia = new Map<number, Date>();

  episodeWatches.forEach((watch) => {
    if (!lastWatchedByMedia.has(watch.media_id)) {
      lastWatchedByMedia.set(watch.media_id, watch.watchedAt);
    }
  });

  const mediaIds = Array.from(lastWatchedByMedia.keys());

  if (mediaIds.length === 0) {
    return {
      ...viewableResource([]),
      pagination: createPaginationMeta(page, limit, 0),
    };
  }

  const mediaRows = await prisma.userMedia.findMany({
    where: {
      userId: id,
      media_id: {
        in: mediaIds,
      },
      media_type: 'tv',
    },
    include: {
      media: true,
    },
  });
  const mediaById = new Map(mediaRows.map((item) => [item.media_id, item]));
  const resolveProgressItem = async (mediaId: number) => {
    const media = mediaById.get(mediaId);
    const lastWatchedAt = lastWatchedByMedia.get(mediaId);

    if (!media || !lastWatchedAt) return null;

    const progress = await getTvProgress(id, String(mediaId));

    if (progress.watchedEpisodeCount === 0 || !progress.nextEpisode) return null;

    return {
      ...formatUserMediaTrackingDetails(flattenMediaSnapshot(media)),
      tvProgress: {
        status: progress.status,
        watchedEpisodeCount: progress.watchedEpisodeCount,
        totalAiredEpisodeCount: progress.totalAiredEpisodeCount,
        nextEpisode: progress.nextEpisode,
        lastWatchedAt: lastWatchedAt.toISOString(),
      },
    };
  };

  const progressItems: Array<NonNullable<Awaited<ReturnType<typeof resolveProgressItem>>>> = [];

  for (let index = 0; index < mediaIds.length; index += TV_PROGRESS_CONCURRENCY) {
    const batch = await Promise.all(
      mediaIds.slice(index, index + TV_PROGRESS_CONCURRENCY).map((mediaId) => resolveProgressItem(mediaId)),
    );

    batch.forEach((item) => {
      if (item) progressItems.push(item);
    });
  }

  progressItems.sort((first, second) => {
    if (sort === 'next') {
      const firstNext = first.tvProgress.nextEpisode;
      const secondNext = second.tvProgress.nextEpisode;

      if (firstNext && secondNext) {
        return firstNext.seasonNumber - secondNext.seasonNumber || firstNext.episodeNumber - secondNext.episodeNumber;
      }

      if (firstNext) return -1;
      if (secondNext) return 1;
    }

    return second.tvProgress.lastWatchedAt.localeCompare(first.tvProgress.lastWatchedAt);
  });

  const start = (page - 1) * limit;
  const paginatedItems = progressItems.slice(start, start + limit);

  return {
    ...viewableResource(paginatedItems),
    pagination: createPaginationMeta(page, limit, progressItems.length),
  };
}
