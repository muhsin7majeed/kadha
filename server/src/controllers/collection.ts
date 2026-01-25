import { prisma } from '@/lib/prisma';
import { getCollectionsSchema } from '@/schemas/collectionSchema';
import { Request, Response } from 'express';
import z from 'zod';

type GetCollectionsRequest = Request<{}, {}, {}, z.infer<typeof getCollectionsSchema>>;

export const getCollections = async (req: GetCollectionsRequest, res: Response) => {
  const { id } = req.user;
  const { mediaId, mediaType } = req.query;

  const collections = await prisma.collection.findMany({
    where: {
      userId: id,
    },
    include: {
      // Only include items check if mediaId and mediaType are provided
      ...(mediaId && mediaType
        ? {
            items: {
              where: {
                media_id: mediaId,
                media_type: mediaType,
              },
              select: { id: true },
              take: 1,
            },
          }
        : {}),
    },
  });

  // Transform response to include hasMedia flag when checking for specific media
  const data =
    mediaId && mediaType
      ? collections.map(({ items, ...collection }) => ({
          ...collection,
          hasMedia: items.length > 0,
        }))
      : collections;

  res.json({ data });
};

export const createCollection = async (req: Request, res: Response) => {
  const { name, description, privacy } = req.body;

  const collection = await prisma.collection.create({
    data: {
      name,
      description,
      privacy,
      userId: req.user.id,
    },
  });

  res.json({ data: collection });
};

export const getCollection = async (req: Request, res: Response) => {
  const { id: collectionId } = req.params;

  const collection = await prisma.collection.findUnique({
    where: {
      id: collectionId,
      userId: req.user.id,
    },
    include: {
      items: true,
    },
  });

  if (!collection) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  const { items, ...rest } = collection;

  res.json({ data: { ...rest, media: items } });
};

export const updateCollection = async (req: Request, res: Response) => {
  const { id: collectionId } = req.params;
  const { name, description, privacy } = req.body;

  const collection = await prisma.collection.update({
    where: {
      id: collectionId,
      userId: req.user.id,
    },
    data: {
      name,
      description,
      privacy,
    },
  });

  res.json({ data: collection });
};

export const deleteCollection = async (req: Request, res: Response) => {
  const { id: collectionId } = req.params;

  await prisma.collection.delete({
    where: {
      id: collectionId,
      userId: req.user.id,
    },
  });

  res.json({ message: 'Collection deleted successfully' });
};

export const toggleCollectionItem = async (req: Request, res: Response) => {
  const collectionId = req.params.id;

  const { media_id, media_type, title, poster_path, vote_average, vote_count, adult, genre_ids, release_date } =
    req.body;

  // Verify the collection exists and belongs to the user
  const collection = await prisma.collection.findUnique({
    where: {
      id: collectionId,
      userId: req.user.id,
    },
  });

  if (!collection) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  // Check if item already exists in the collection
  const existingItem = await prisma.collectionItem.findUnique({
    where: {
      collectionId_media_id_media_type: {
        collectionId,
        media_id,
        media_type,
      },
    },
  });

  if (existingItem) {
    // Remove from collection
    await prisma.collectionItem.delete({
      where: { id: existingItem.id },
    });

    return res.json({ data: null, removed: true });
  }

  // Add to collection
  const collectionItem = await prisma.collectionItem.create({
    data: {
      collectionId,
      media_id,
      media_type,
      title,
      poster_path,
      vote_average,
      vote_count,
      adult,
      genre_ids: genre_ids ? JSON.stringify(genre_ids) : null,
      release_date,
    },
  });

  return res.json({ data: collectionItem, added: true });
};
