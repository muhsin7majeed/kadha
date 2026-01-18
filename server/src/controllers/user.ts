import { Request, Response } from 'express';
import UserModel from '@/models/user';
import UserMediaSchema from '@/models/user-media';

export const getMe = async (req: Request, res: Response) => {
  const { id } = req.user;

  const user = await UserModel.findById(id);

  console.log("REQUEST USER", req.user);
  console.log("USER", user);


  const userWithoutPassword = user?.toObject();

  delete (userWithoutPassword as any)?.password;

  res.json(userWithoutPassword);
};

export const getUserWatchlist = async (req: Request, res: Response) => {
  const { id } = req.user;

  const watchlist = await UserMediaSchema.find({
    userId: id,
    watchlist: true,
  }).sort({ updatedAt: -1 });

  res.json({
    data: watchlist,
  });
};

export const getUserLiked = async (req: Request, res: Response) => {
  const { id } = req.user;

  const liked = await UserMediaSchema.find({
    userId: id,
    liked: true,
  }).sort({ updatedAt: -1 });

  res.json({
    data: liked,
  });
};

export const getUserWatched = async (req: Request, res: Response) => {
  const { id } = req.user;

  const watched = await UserMediaSchema.find({
    userId: id,
    watched: true,
  }).sort({ updatedAt: -1 });

  res.json({
    data: watched,
  });
};
