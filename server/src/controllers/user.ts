import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { DataPrivacy } from '@/types/common';

export const getMe = async (req: Request, res: Response) => {
  const { id } = req.user;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      profilePrivacy: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json(user);
};

export const updateMe = async (req: Request, res: Response) => {
  const { id } = req.user;
  const { username, profilePrivacy } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });

  if (user && user.id !== id) {
    return res.status(400).json({ fieldErrors: { username: 'Username already exists' } });
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { username, profilePrivacy },
  });

  res.json({
    data: {
      id: updatedUser.id,
      username: updatedUser.username,
      profilePrivacy: updatedUser.profilePrivacy,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    },
  });
};

export const searchUsers = async (req: Request, res: Response) => {
  const { query } = req.query;

  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: query as string,
      },
      profilePrivacy: {
        in: [DataPrivacy.Friends, DataPrivacy.Everyone],
      },
    },
  });

  res.json({
    data: users,
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
