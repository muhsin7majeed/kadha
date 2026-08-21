import { CollectionMemberRole, DataPrivacy, FriendStatus, MediaType, UserActivityType } from '@prisma/client';
import bcrypt from 'bcrypt';

import { fetchMediaDetails } from '@/features/media/tmdb.client';
import type { TMDBMovieDetails, TMDBTvDetails } from '@/features/media/media.types';
import { prisma } from '@/lib/prisma';

const DEMO_USERNAME = 'filmlover';
const DEMO_PASSWORD = 'KadhaDemo2026!';

const media = [
  { id: 157336, type: MediaType.movie }, // Interstellar
  { id: 693134, type: MediaType.movie }, // Dune: Part Two
  { id: 545611, type: MediaType.movie }, // Everything Everywhere All at Once
  { id: 329865, type: MediaType.movie }, // Arrival
  { id: 335984, type: MediaType.movie }, // Blade Runner 2049
  { id: 95396, type: MediaType.tv }, // Severance
  { id: 136315, type: MediaType.tv }, // The Bear
  { id: 94605, type: MediaType.tv }, // Arcane
] as const;

const watchedAt = (daysAgo: number) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

const serializeSnapshot = (details: TMDBMovieDetails | TMDBTvDetails, type: MediaType) => {
  const isMovie = type === MediaType.movie;
  const movie = isMovie ? (details as TMDBMovieDetails) : null;
  const tv = !isMovie ? (details as TMDBTvDetails) : null;

  return {
    media_id: details.id,
    media_type: type,
    title: movie?.title ?? tv?.name ?? null,
    original_title: movie?.original_title ?? tv?.original_name ?? null,
    overview: details.overview,
    poster_path: details.poster_path,
    backdrop_path: details.backdrop_path,
    vote_average: details.vote_average,
    vote_count: details.vote_count,
    popularity: details.popularity,
    adult: details.adult,
    genre_ids: JSON.stringify(details.genres.map((genre) => genre.id)),
    release_date: movie?.release_date ?? tv?.first_air_date ?? null,
    original_language: details.original_language,
    runtime: movie?.runtime ?? tv?.episode_run_time[0] ?? null,
    status: details.status,
  };
};

async function main() {
  if (process.env.KADHA_DEMO_SEED !== 'true') {
    throw new Error('Refusing to seed demo data unless KADHA_DEMO_SEED=true');
  }

  const snapshots = await Promise.all(
    media.map(async ({ id, type }) => {
      const details = await fetchMediaDetails(type, id);
      return serializeSnapshot(details, type);
    }),
  );

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.$transaction(async (tx) => {
    await tx.user.deleteMany({ where: { username: { in: [DEMO_USERNAME, 'cinemafriend'] } } });

    for (const snapshot of snapshots) {
      await tx.mediaSnapshot.upsert({
        where: {
          media_id_media_type: {
            media_id: snapshot.media_id,
            media_type: snapshot.media_type,
          },
        },
        update: snapshot,
        create: snapshot,
      });
    }

    const owner = await tx.user.create({
      data: {
        username: DEMO_USERNAME,
        password,
        watchRegion: 'IN',
        profilePrivacy: DataPrivacy.FRIENDS,
        watchedPrivacy: DataPrivacy.FRIENDS,
        likedPrivacy: DataPrivacy.FRIENDS,
        watchlistPrivacy: DataPrivacy.ONLY_ME,
      },
    });

    const friend = await tx.user.create({
      data: {
        username: 'cinemafriend',
        password,
        watchRegion: 'IN',
        profilePrivacy: DataPrivacy.FRIENDS,
      },
    });

    await tx.friendship.create({
      data: {
        senderId: owner.id,
        receiverId: friend.id,
        status: FriendStatus.ACCEPTED,
      },
    });

    await tx.userMedia.createMany({
      data: [
        {
          userId: owner.id,
          media_id: 693134,
          media_type: MediaType.movie,
          liked: true,
          watched: true,
          likedAt: watchedAt(4),
          watchedAt: watchedAt(4),
          watchedOn: watchedAt(4),
          rating: 5,
          ratedAt: watchedAt(4),
          watchedNote: 'A staggering big-screen experience.',
        },
        {
          userId: owner.id,
          media_id: 545611,
          media_type: MediaType.movie,
          liked: true,
          watched: true,
          likedAt: watchedAt(12),
          watchedAt: watchedAt(12),
          rating: 5,
          ratedAt: watchedAt(12),
        },
        {
          userId: owner.id,
          media_id: 329865,
          media_type: MediaType.movie,
          watched: true,
          watchedAt: watchedAt(28),
          rating: 4,
          ratedAt: watchedAt(28),
        },
        {
          userId: owner.id,
          media_id: 335984,
          media_type: MediaType.movie,
          watchlist: true,
          watchlistAt: watchedAt(2),
          watchlistNote: 'Rewatch on a rainy evening.',
        },
        {
          userId: owner.id,
          media_id: 95396,
          media_type: MediaType.tv,
          liked: true,
          likedAt: watchedAt(8),
        },
        {
          userId: owner.id,
          media_id: 136315,
          media_type: MediaType.tv,
          liked: true,
          likedAt: watchedAt(1),
        },
        {
          userId: owner.id,
          media_id: 94605,
          media_type: MediaType.tv,
          watchlist: true,
          watchlistAt: watchedAt(6),
        },
      ],
    });

    await tx.userEpisodeWatch.createMany({
      data: Array.from({ length: 5 }, (_, index) => ({
        userId: owner.id,
        media_id: 136315,
        media_type: MediaType.tv,
        seasonNumber: 1,
        episodeNumber: index + 1,
        watchedAt: watchedAt(6 - index),
      })),
    });

    const collection = await tx.collection.create({
      data: {
        userId: owner.id,
        name: 'Modern masterpieces',
        description: 'Beautiful, ambitious films worth returning to.',
        privacy: DataPrivacy.FRIENDS,
        members: {
          create: {
            userId: friend.id,
            role: CollectionMemberRole.EDITOR,
          },
        },
      },
    });

    await tx.collectionItem.createMany({
      data: [157336, 693134, 545611, 329865, 335984].map((mediaId, index) => ({
        collectionId: collection.id,
        media_id: mediaId,
        media_type: MediaType.movie,
        addedByUserId: index % 2 === 0 ? owner.id : friend.id,
      })),
    });

    await tx.userActivity.createMany({
      data: [
        {
          userId: owner.id,
          type: UserActivityType.COLLECTION_CREATED,
          collectionId: collection.id,
          metadata: JSON.stringify({ title: collection.name }),
          createdAt: watchedAt(18),
        },
        {
          userId: owner.id,
          type: UserActivityType.MEDIA_WATCHED,
          media_id: 693134,
          media_type: MediaType.movie,
          metadata: JSON.stringify({ title: 'Dune: Part Two', poster_path: snapshots[1].poster_path }),
          createdAt: watchedAt(4),
        },
        {
          userId: owner.id,
          type: UserActivityType.MEDIA_LIKED,
          media_id: 136315,
          media_type: MediaType.tv,
          metadata: JSON.stringify({ title: 'The Bear', poster_path: snapshots[6].poster_path }),
          createdAt: watchedAt(1),
        },
        {
          userId: owner.id,
          type: UserActivityType.MEDIA_WATCHLISTED,
          media_id: 335984,
          media_type: MediaType.movie,
          metadata: JSON.stringify({ title: 'Blade Runner 2049', poster_path: snapshots[4].poster_path }),
          createdAt: watchedAt(2),
        },
      ],
    });
  });

  console.log(`Seeded demo account ${DEMO_USERNAME}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
