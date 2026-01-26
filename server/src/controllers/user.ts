import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';

export const getMe = async (req: Request, res: Response) => {
  const { id } = req.user;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json(user);
};

export const updateMe = async (req: Request, res: Response) => {
  const { id } = req.user;
  const { username } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });

  if (user?.id === id) {
    return res.status(200).json({ message: 'Username is the same as the current username' });
  }

  if (user) {
    return res.status(400).json({ fieldErrors: { username: 'Username already exists' } });
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { username },
  });

  res.json({
    data: {
      id: updatedUser.id,
      username: updatedUser.username,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    },
  });
};

export const getUserWatchlist = async (req: Request, res: Response) => {
  const { id } = req.user;

  const watchlist = await prisma.userMedia.findMany({
    where: {
      userId: id,
      watchlist: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  res.json({
    data: watchlist,
  });
};

export const getUserLiked = async (req: Request, res: Response) => {
  const { id } = req.user;

  const liked = await prisma.userMedia.findMany({
    where: {
      userId: id,
      liked: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  res.json({
    data: liked,
  });
};

export const getUserWatched = async (req: Request, res: Response) => {
  const { id } = req.user;

  const watched = await prisma.userMedia.findMany({
    where: {
      userId: id,
      watched: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  res.json({
    data: watched,
  });
};
