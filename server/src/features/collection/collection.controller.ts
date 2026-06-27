import { Request, Response } from 'express';

import {
  CollectionPayload,
  getCollectionsSchema,
  GetCollectionsQuery,
  ToggleCollectionPayload,
} from './collection.schema';
import {
  createUserCollection,
  deleteUserCollection,
  getUserCollection,
  getUserCollections,
  toggleUserCollectionItem,
  updateUserCollection,
} from './collection.service';
import z from 'zod';

type GetCollectionsRequest = Request<{}, {}, {}, z.infer<typeof getCollectionsSchema>>;

export const getCollections = async (req: GetCollectionsRequest, res: Response) => {
  const data = await getUserCollections(req.user.id, req.query as GetCollectionsQuery);

  res.json({ data });
};

export const createCollection = async (req: Request, res: Response) => {
  const data = await createUserCollection(req.user.id, req.body as CollectionPayload);

  res.json({ data });
};

export const getCollection = async (req: Request, res: Response) => {
  const data = await getUserCollection(req.user.id, req.params.id);

  if (!data) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  res.json({ data });
};

export const updateCollection = async (req: Request, res: Response) => {
  const data = await updateUserCollection(req.user.id, req.params.id, req.body as CollectionPayload);

  res.json({ data });
};

export const deleteCollection = async (req: Request, res: Response) => {
  await deleteUserCollection(req.user.id, req.params.id);

  res.json({ message: 'Collection deleted successfully' });
};

export const toggleCollectionItem = async (req: Request, res: Response) => {
  const result = await toggleUserCollectionItem(req.user.id, req.params.id, req.body as ToggleCollectionPayload);

  if (!result) {
    return res.status(404).json({ error: 'Collection not found' });
  }

  return res.json(result);
};
