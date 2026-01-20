import { prisma } from '@/lib/prisma';
import { Request, Response } from 'express';

export const getCollections = async (_req: Request, res: Response) => {
  res.json({ data: [] });
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
  res.json({ data: [] });
};

export const updateCollection = async (req: Request, res: Response) => {
  res.json({ data: [] });
};

export const deleteCollection = async (req: Request, res: Response) => {
  res.json({ data: [] });
};

export const addItemsToCollection = async (req: Request, res: Response) => {
  res.json({ data: [] });
};

export const removeItemsFromCollection = async (req: Request, res: Response) => {
  res.json({ data: [] });
};
