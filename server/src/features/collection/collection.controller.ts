import { Request, Response } from 'express';

import { sendData, sendMessage, sendResponse } from '@/lib/http';
import { requireAuthUser } from '@/middlewares/auth';
import {
  CollectionPayload,
  CreateCollectionInvitePayload,
  getCollectionsSchema,
  GetCollectionsQuery,
  RespondToCollectionInvitePayload,
  ToggleCollectionPayload,
} from './collection.schema';
import {
  createCollectionInvite,
  createUserCollection,
  deleteUserCollection,
  getUserCollection,
  getUserCollections,
  respondToCollectionInvite,
  searchUsersForCollectionInvite,
  toggleUserCollectionItem,
  updateUserCollection,
} from './collection.service';
import z from 'zod';

type GetCollectionsRequest = Request<{}, {}, {}, z.infer<typeof getCollectionsSchema>>;
type SearchInviteUsersRequest = Request<{ id: string }, {}, {}, { q?: string }>;

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

  return sendResponse(res, result);
};

export const searchInviteUsers = async (req: SearchInviteUsersRequest, res: Response) => {
  const data = await searchUsersForCollectionInvite(requireAuthUser(req).id, req.params.id, req.query.q ?? '');

  sendData(res, data);
};

export const inviteUserToCollection = async (req: Request, res: Response) => {
  const data = await createCollectionInvite(
    requireAuthUser(req).id,
    req.params.id,
    req.body as CreateCollectionInvitePayload,
  );

  sendData(res, data, 201);
};

export const respondToInvite = async (req: Request, res: Response) => {
  const data = await respondToCollectionInvite(
    requireAuthUser(req).id,
    req.params.inviteId,
    req.body as RespondToCollectionInvitePayload,
  );

  sendData(res, data);
};
