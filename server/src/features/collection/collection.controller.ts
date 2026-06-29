import { Request, Response } from 'express';

import { notFound, sendData, sendMessage, sendResponse } from '@/lib/http';
import { requireAuthUser } from '@/middlewares/auth';
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
  const data = await getUserCollections(requireAuthUser(req).id, req.query as GetCollectionsQuery);

  sendData(res, data);
};

export const createCollection = async (req: Request, res: Response) => {
  const data = await createUserCollection(requireAuthUser(req).id, req.body as CollectionPayload);

  sendData(res, data);
};

export const getCollection = async (req: Request, res: Response) => {
  const data = await getUserCollection(requireAuthUser(req).id, req.params.id);

  if (!data) {
    throw notFound('Collection not found');
  }

  sendData(res, data);
};

export const updateCollection = async (req: Request, res: Response) => {
  const data = await updateUserCollection(requireAuthUser(req).id, req.params.id, req.body as CollectionPayload);

  sendData(res, data);
};

export const deleteCollection = async (req: Request, res: Response) => {
  await deleteUserCollection(requireAuthUser(req).id, req.params.id);

  sendMessage(res, 'Collection deleted successfully');
};

export const toggleCollectionItem = async (req: Request, res: Response) => {
  const result = await toggleUserCollectionItem(
    requireAuthUser(req).id,
    req.params.id,
    req.body as ToggleCollectionPayload,
  );

  if (!result) {
    throw notFound('Collection not found');
  }

  return sendResponse(res, result);
};
