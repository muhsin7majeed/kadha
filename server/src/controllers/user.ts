import { Request, Response } from "express";
import userModel from "@/models/user";
import UserMediaModel from "@/models/user-media";

export const getMe = async (req: Request, res: Response) => {
  const { id } = req.user;

  const user = await userModel.findById(id);

  const userWithoutPassword = user?.toObject();

  delete (userWithoutPassword as any)?.password;

  res.json(userWithoutPassword);
};

export const getUserWatchlist = async (req: Request, res: Response) => {
  const { id } = req.user;

  const watchlist = await UserMediaModel.find({
    userId: id,
    watchlist: true,
  }).sort({ updatedAt: -1 });

  res.json({
    data: watchlist,
  });
};

export const getUserLiked = async (req: Request, res: Response) => {
  const { id } = req.user;

  const liked = await UserMediaModel.find({
    userId: id,
    liked: true,
  }).sort({ updatedAt: -1 });

  res.json({
    data: liked,
  });
};

export const getUserWatched = async (req: Request, res: Response) => {
  const { id } = req.user;

  const watched = await UserMediaModel.find({
    userId: id,
    watched: true,
  }).sort({ updatedAt: -1 });

  res.json({
    data: watched,
  });
};
