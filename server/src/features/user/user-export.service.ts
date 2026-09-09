import { CollectionMemberRole } from '@prisma/client';

import { envConfig } from '@/config/env';
import { prisma } from '@/lib/prisma';
import {
  DEFAULT_NAVIGATION_PREFERENCES,
  normalizeNavigationPreferences,
  parseStoredNavigationPreferences,
} from '@/features/navigation-preferences/navigation-preferences.service';
import {
  EXCLUDED_EXPORT_DATA,
  type ExportCategory,
  EXPORT_CATEGORIES,
  type ImportCategory,
  REFERENCE_ONLY_EXPORT_CATEGORIES,
} from './user-export.types';

const publicUserSelect = {
  id: true,
  username: true,
} as const;

export async function exportCurrentUserData(id: string, categories: ExportCategory[] = [...EXPORT_CATEGORIES]) {
  const [
    account,
    media,
    watchEvents,
    collections,
    collectionMemberships,
    collectionInvites,
    friendships,
    notifications,
    activity,
    recommendationSettings,
    recommendationFeedback,
    navigationPreferences,
  ] = await prisma.$transaction([
    prisma.user.findUnique({
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
    }),
    prisma.userMedia.findMany({
      where: { userId: id },
      include: {
        media: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }),
    prisma.watchEvent.findMany({
      where: { userId: id },
      orderBy: {
        watchedAt: 'desc',
      },
    }),
    prisma.collection.findMany({
      where: { userId: id },
      include: {
        items: {
          include: {
            media: true,
          },
          orderBy: {
            created_at: 'asc',
          },
        },
        members: {
          include: {
            user: {
              select: publicUserSelect,
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        invites: {
          include: {
            inviter: {
              select: publicUserSelect,
            },
            invitee: {
              select: publicUserSelect,
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    }),
    prisma.collectionMember.findMany({
      where: { userId: id },
      include: {
        collection: {
          select: {
            id: true,
            userId: true,
            name: true,
            description: true,
            privacy: true,
            created_at: true,
            updated_at: true,
            user: {
              select: publicUserSelect,
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }),
    prisma.collectionInvite.findMany({
      where: {
        OR: [{ inviterId: id }, { inviteeId: id }],
      },
      include: {
        collection: {
          select: {
            id: true,
            userId: true,
            name: true,
            description: true,
            privacy: true,
            created_at: true,
            updated_at: true,
          },
        },
        inviter: {
          select: publicUserSelect,
        },
        invitee: {
          select: publicUserSelect,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.friendship.findMany({
      where: {
        OR: [{ senderId: id }, { receiverId: id }],
      },
      include: {
        sender: {
          select: publicUserSelect,
        },
        receiver: {
          select: publicUserSelect,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }),
    prisma.notification.findMany({
      where: { userId: id },
      include: {
        actor: {
          select: publicUserSelect,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.userActivity.findMany({
      where: { userId: id },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.recommendationSettings.findUnique({
      where: { userId: id },
    }),
    prisma.recommendationFeedback.findMany({
      where: { userId: id },
      include: {
        media: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }),
    prisma.navigationPreferences.findUnique({
      where: { userId: id },
    }),
  ]);

  const selected = new Set(categories);
  const importable: ImportCategory[] = [];
  if (selected.has('accountPreferences')) importable.push('accountPreferences');
  if (selected.has('mediaTracking')) importable.push('mediaTracking');
  if (selected.has('watchHistory')) importable.push('watchHistory');
  if (selected.has('collections')) importable.push('collections');
  if (selected.has('recommendations')) importable.push('recommendationSettings', 'recommendationFeedback');

  const mediaSnapshots = new Map<string, (typeof media)[number]['media']>();
  const addMediaSnapshot = (snapshot: (typeof media)[number]['media']) => {
    mediaSnapshots.set(`${snapshot.media_type}:${snapshot.media_id}`, snapshot);
  };
  if (selected.has('mediaTracking')) media.forEach((item) => addMediaSnapshot(item.media));
  if (selected.has('watchHistory')) {
    const watchedMedia = new Set(watchEvents.map((event) => `${event.media_type}:${event.media_id}`));
    media
      .filter((item) => watchedMedia.has(`${item.media_type}:${item.media_id}`))
      .forEach((item) => addMediaSnapshot(item.media));
  }
  if (selected.has('collections'))
    collections.forEach((collection) => collection.items.forEach((item) => addMediaSnapshot(item.media)));
  if (selected.has('recommendations')) recommendationFeedback.forEach((item) => addMediaSnapshot(item.media));

  const data: Record<string, unknown> = {};
  if (selected.has('accountPreferences') && account) {
    data.accountPreferences = {
      username: account.username,
      profilePrivacy: account.profilePrivacy,
      watchedPrivacy: account.watchedPrivacy,
      likedPrivacy: account.likedPrivacy,
      watchlistPrivacy: account.watchlistPrivacy,
      watchRegion: account.watchRegion,
      navigation: navigationPreferences
        ? normalizeNavigationPreferences(parseStoredNavigationPreferences(navigationPreferences.config))
        : DEFAULT_NAVIGATION_PREFERENCES,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
  if (mediaSnapshots.size > 0) {
    data.mediaSnapshots = [...mediaSnapshots.values()].map((snapshot) => ({
      media_id: snapshot.media_id,
      media_type: snapshot.media_type,
      title: snapshot.title,
      original_title: snapshot.original_title,
      overview: snapshot.overview,
      poster_path: snapshot.poster_path,
      backdrop_path: snapshot.backdrop_path,
      vote_average: snapshot.vote_average,
      vote_count: snapshot.vote_count,
      popularity: snapshot.popularity,
      adult: snapshot.adult,
      genre_ids: snapshot.genre_ids,
      release_date: snapshot.release_date,
      original_language: snapshot.original_language,
      runtime: snapshot.runtime,
      status: snapshot.status,
    }));
  }
  if (selected.has('mediaTracking')) {
    data.mediaTracking = media.map((item) => ({
      media_id: item.media_id,
      media_type: item.media_type,
      liked: item.liked,
      watched: item.watched,
      watchlist: item.watchlist,
      likedAt: item.likedAt,
      watchedAt: item.watchedAt,
      watchlistAt: item.watchlistAt,
      rating: item.rating,
      ratedAt: item.ratedAt,
      watchedOn: item.watchedOn,
      likedNote: item.likedNote,
      watchedNote: item.watchedNote,
      watchlistNote: item.watchlistNote,
    }));
  }
  if (selected.has('watchHistory')) {
    data.watchEvents = watchEvents.map((event) => ({
      eventId: event.id,
      media_id: event.media_id,
      media_type: event.media_type,
      seasonNumber: event.seasonNumber,
      episodeNumber: event.episodeNumber,
      episodeId: event.episodeId,
      watchedAt: event.watchedAt,
      watchedOn: event.watchedOn,
      rating: event.rating,
      note: event.note,
    }));
  }
  if (selected.has('collections')) {
    data.collections = collections.map((collection) => ({
      name: collection.name,
      description: collection.description,
      privacy: collection.privacy,
      createdAt: collection.created_at,
      updatedAt: collection.updated_at,
      items: collection.items.map((item) => ({
        media_id: item.media_id,
        media_type: item.media_type,
        createdAt: item.created_at,
      })),
    }));
  }
  if (selected.has('recommendations')) {
    data.recommendationSettings = recommendationSettings
      ? {
          useLiked: recommendationSettings.useLiked,
          useRatings: recommendationSettings.useRatings,
          useWatched: recommendationSettings.useWatched,
          useRewatchHistory: recommendationSettings.useRewatchHistory,
          useWatchlist: recommendationSettings.useWatchlist,
          excludeWatched: recommendationSettings.excludeWatched,
        }
      : null;
    data.recommendationFeedback = recommendationFeedback.map((item) => ({
      media_id: item.media_id,
      media_type: item.media_type,
      type: item.type,
    }));
  }
  if (selected.has('friendships')) {
    data.friendships = friendships.map((item) => ({
      sender: item.sender.username,
      receiver: item.receiver.username,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }
  if (selected.has('collectionRelationships')) {
    data.collectionMemberships = [
      ...collectionMemberships.map((item) => ({
        collection: item.collection.name,
        owner: item.collection.user.username,
        member: account?.username ?? null,
        role: item.role,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      ...collections.flatMap((collection) =>
        collection.members.map((member) => ({
          collection: collection.name,
          owner: account?.username ?? null,
          member: member.user.username,
          role: member.role,
          createdAt: member.createdAt,
          updatedAt: member.updatedAt,
        })),
      ),
    ];
    const relatedInvites = new Map<
      string,
      {
        collection: string;
        inviter: string;
        invitee: string;
        role: CollectionMemberRole;
        status: (typeof collectionInvites)[number]['status'];
        respondedAt: Date | null;
        revokedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
      }
    >();
    for (const invite of collectionInvites) {
      relatedInvites.set(invite.id, {
        collection: invite.collection.name,
        inviter: invite.inviter.username,
        invitee: invite.invitee.username,
        role: invite.role,
        status: invite.status,
        respondedAt: invite.respondedAt,
        revokedAt: invite.revokedAt,
        createdAt: invite.createdAt,
        updatedAt: invite.updatedAt,
      });
    }
    for (const collection of collections) {
      for (const invite of collection.invites) {
        relatedInvites.set(invite.id, {
          collection: collection.name,
          inviter: invite.inviter.username,
          invitee: invite.invitee.username,
          role: invite.role,
          status: invite.status,
          respondedAt: invite.respondedAt,
          revokedAt: invite.revokedAt,
          createdAt: invite.createdAt,
          updatedAt: invite.updatedAt,
        });
      }
    }
    data.collectionInvites = [...relatedInvites.values()];
  }
  if (selected.has('notifications')) {
    data.notifications = notifications.map((item) => ({
      type: item.type,
      read: item.read,
      actor: item.actor?.username ?? null,
      entityType: item.entityType,
      metadata: item.metadata,
      readAt: item.readAt,
      resolvedAt: item.resolvedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }
  if (selected.has('activity')) {
    data.activity = activity.map((item) => ({
      type: item.type,
      media_id: item.media_id,
      media_type: item.media_type,
      metadata: item.metadata,
      createdAt: item.createdAt,
    }));
  }

  return {
    format: 'kadha-data-export',
    schemaVersion: 2,
    exportedAt: new Date().toISOString(),
    app: { name: envConfig.appName, version: envConfig.version },
    manifest: {
      selected: categories,
      importable,
      referenceOnly: REFERENCE_ONLY_EXPORT_CATEGORIES.filter((category) => selected.has(category)),
      excluded: EXCLUDED_EXPORT_DATA,
    },
    data,
  };
}
