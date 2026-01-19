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
