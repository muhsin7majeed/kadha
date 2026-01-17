import { Request, Response } from 'express';
import UserMediaModel from '@/models/user-media';

export const addToLiked = async (req: Request, res: Response) => {
  const { id, media_type, liked, title, poster_path, vote_average, vote_count, adult, genre_ids, release_date } =
    req.body;

  await UserMediaModel.findOneAndUpdate(
    { userId: req.user.id, media_id: id, media_type: media_type },
    {
      $set: {
        liked,
        title,
        poster_path,
        vote_average,
        vote_count,
        adult,
        genre_ids,
        release_date,
      },
    },
    { upsert: true, new: true },
  );

  return res.json({ message: `${media_type} ${liked ? 'liked' : 'unliked'}` });
};

export const addToWatched = async (req: Request, res: Response) => {
  const { id, media_type, watched, title, poster_path, vote_average, vote_count, adult, genre_ids, release_date } =
    req.body;

  await UserMediaModel.findOneAndUpdate(
    { userId: req.user.id, media_id: id, media_type: media_type },
    {
      $set: {
        watched,
        watchlist: false,
        title,
        poster_path,
        vote_average,
        vote_count,
        adult,
        genre_ids,
        release_date,
      },
    },
    { upsert: true, new: true },
  );

  // TODO: Check if media needs to be removed from watchlist

  return res.json({
    message: `${media_type} ${watched ? 'watched' : 'unwatched'}`,
  });
};

export const addToWatchlist = async (req: Request, res: Response) => {
  const { id, media_type, watchlist, title, poster_path, vote_average, vote_count, adult, genre_ids, release_date } =
    req.body;

  await UserMediaModel.findOneAndUpdate(
    { userId: req.user.id, media_id: id, media_type: media_type },
    {
      $set: {
        watchlist,
        title,
        poster_path,
        vote_average,
        vote_count,
        adult,
        genre_ids,
        release_date,
      },
    },
    { upsert: true, new: true },
  );

  return res.json({
    message: `${media_type} ${watchlist ? 'added to watchlist' : 'removed from watchlist'}`,
  });
};
