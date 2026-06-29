import { UserActivityType } from '@prisma/client';

import { createUserActivity } from '@/features/activity/activity.service';
import { flattenMediaSnapshot, upsertMediaSnapshot } from '@/features/media/media-snapshot.service';
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

  return prisma.$transaction(async (tx) => {
    const collection = await tx.collection.create({
      data: {
        name,
        description,
        privacy,
        userId,
      },
    });

    await createUserActivity(
      {
        userId,
        type: UserActivityType.COLLECTION_CREATED,
        collectionId: collection.id,
        metadata: {
          collectionName: collection.name,
          collectionDescription: collection.description,
          collectionPrivacy: collection.privacy,
        },
      },
      tx,
    );

    return collection;
  });
}

export async function getUserCollection(userId: string, collectionId: string) {
  const collection = await prisma.collection.findUnique({
    where: {
      id: collectionId,
      userId,
    },
    include: {
      items: {
        include: {
          media: true,
        },
      },
    },
  });

  if (!collection) {
    return null;
  }

  const { items, ...rest } = collection;

  return { ...rest, media: items.map(flattenMediaSnapshot) };
}

export async function updateUserCollection(userId: string, collectionId: string, payload: CollectionPayload) {
  const { name, description, privacy } = payload;

  return prisma.$transaction(async (tx) => {
    const existingCollection = await tx.collection.findUnique({
      where: {
        id: collectionId,
        userId,
      },
    });

    const collection = await tx.collection.update({
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

    if (
      existingCollection &&
      (existingCollection.name !== collection.name ||
        existingCollection.description !== collection.description ||
        existingCollection.privacy !== collection.privacy)
    ) {
      await createUserActivity(
        {
          userId,
          type: UserActivityType.COLLECTION_UPDATED,
          collectionId: collection.id,
          metadata: {
            collectionName: collection.name,
            collectionDescription: collection.description,
            collectionPrivacy: collection.privacy,
          },
        },
        tx,
      );
    }

    return collection;
  });
}

export async function deleteUserCollection(userId: string, collectionId: string) {
  return prisma.$transaction(async (tx) => {
    const collection = await tx.collection.delete({
      where: {
        id: collectionId,
        userId,
      },
    });

    await createUserActivity(
      {
        userId,
        type: UserActivityType.COLLECTION_DELETED,
        collectionId: collection.id,
        metadata: {
          collectionName: collection.name,
          collectionDescription: collection.description,
          collectionPrivacy: collection.privacy,
        },
      },
      tx,
    );

    return collection;
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
    await prisma.$transaction(async (tx) => {
      const removedItem = await tx.collectionItem.delete({
        where: { id: existingItem.id },
        include: {
          media: true,
        },
      });
      const removedMedia = flattenMediaSnapshot(removedItem);

      await createUserActivity(
        {
          userId,
          type: UserActivityType.COLLECTION_ITEM_REMOVED,
          media_id: removedItem.media_id,
          media_type: removedItem.media_type,
          collectionId,
          metadata: {
            title: removedMedia.title,
            poster_path: removedMedia.poster_path,
            collectionName: collection.name,
          },
        },
        tx,
      );
    });

    return { data: null, removed: true };
  }

  const collectionItem = await prisma.$transaction(async (tx) => {
    await upsertMediaSnapshot(payload, tx);

    const createdItem = await tx.collectionItem.create({
      data: {
        collectionId,
        media_id: payload.media_id,
        media_type: payload.media_type,
      },
      include: {
        media: true,
      },
    });
    const createdMedia = flattenMediaSnapshot(createdItem);

    await createUserActivity(
      {
        userId,
        type: UserActivityType.COLLECTION_ITEM_ADDED,
        media_id: createdItem.media_id,
        media_type: createdItem.media_type,
        collectionId,
        metadata: {
          title: createdMedia.title,
          poster_path: createdMedia.poster_path,
          collectionName: collection.name,
        },
      },
      tx,
    );

    return createdMedia;
  });

  return { data: collectionItem, added: true };
}
