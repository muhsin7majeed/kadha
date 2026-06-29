import { prisma } from '@/lib/prisma';
import { CollectionPayload, GetCollectionsQuery, ToggleCollectionPayload } from './collection.schema';

export async function getUserCollections(userId: string, query: GetCollectionsQuery) {
  const { mediaId, mediaType } = query;

  const collections = await prisma.collection.findMany({
    where: {
      userId,
    },
    include: {
      ...(mediaId && mediaType
        ? {
            items: {
              where: {
                media_id: parseInt(mediaId),
                media_type: mediaType,
              },
              select: { id: true },
              take: 1,
            },
          }
        : {}),
    },
  });

  return mediaId && mediaType
    ? collections.map(({ items, ...collection }) => ({
        ...collection,
        hasMedia: items.length > 0,
      }))
    : collections;
}

export async function createUserCollection(userId: string, payload: CollectionPayload) {
  const { name, description, privacy } = payload;

  return prisma.collection.create({
    data: {
      name,
      description,
      privacy,
      userId,
    },
  });
}

export async function getUserCollection(userId: string, collectionId: string) {
  const collection = await prisma.collection.findUnique({
    where: {
      id: collectionId,
      userId,
    },
    include: {
      items: true,
    },
  });

  if (!collection) {
    return null;
  }

  const { items, ...rest } = collection;

  return { ...rest, media: items };
}

export async function updateUserCollection(userId: string, collectionId: string, payload: CollectionPayload) {
  const { name, description, privacy } = payload;

  return prisma.collection.update({
    where: {
      id: collectionId,
      userId,
    },
    data: {
      name,
      description,
      privacy,
    },
  });
}

export async function deleteUserCollection(userId: string, collectionId: string) {
  return prisma.collection.delete({
    where: {
      id: collectionId,
      userId,
    },
  });
}

export async function toggleUserCollectionItem(userId: string, collectionId: string, payload: ToggleCollectionPayload) {
  const collection = await prisma.collection.findUnique({
    where: {
      id: collectionId,
      userId,
    },
  });

  if (!collection) {
    return null;
  }

  const existingItem = await prisma.collectionItem.findUnique({
    where: {
      collectionId_media_id_media_type: {
        collectionId,
        media_id: payload.media_id,
        media_type: payload.media_type,
      },
    },
  });

  if (existingItem) {
    await prisma.collectionItem.delete({
      where: { id: existingItem.id },
    });

    return { data: null, removed: true };
  }

  const collectionItem = await prisma.collectionItem.create({
    data: {
      collectionId,
      media_id: payload.media_id,
      media_type: payload.media_type,
      title: payload.title,
      poster_path: payload.poster_path,
      vote_average: payload.vote_average,
      vote_count: payload.vote_count,
      adult: payload.adult,
      genre_ids: payload.genre_ids ? JSON.stringify(payload.genre_ids) : null,
      release_date: payload.release_date,
    },
  });

  return { data: collectionItem, added: true };
}
