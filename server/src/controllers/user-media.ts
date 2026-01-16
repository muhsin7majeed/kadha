import { Request, Response } from 'express';
import UserMediaModel from '@/models/user-media';

export const addToLiked = async (req: Request, res: Response) => {
  const { mediaId, mediaType, liked, title, posterPath, voteAverage, voteCount, adult, genreIds, releaseDate } =
    req.body;

  await UserMediaModel.findOneAndUpdate(
    { userId: req.user.id, mediaId, mediaType },
    {
      $set: {
        liked,
        title,
        posterPath,
        voteAverage,
        voteCount,
        adult,
        genreIds,
        releaseDate,
      },
    },
    { upsert: true, new: true },
  );

  return res.json({ message: `${mediaType} ${liked ? 'liked' : 'unliked'}` });
};

export const addToWatched = async (req: Request, res: Response) => {
  const { mediaId, mediaType, watched, title, posterPath, voteAverage, voteCount, adult, genreIds, releaseDate } =
    req.body;

  await UserMediaModel.findOneAndUpdate(
    { userId: req.user.id, mediaId, mediaType },
    {
      $set: {
        watched,
        title,
        posterPath,
        voteAverage,
        voteCount,
        adult,
        genreIds,
        releaseDate,
      },
    },
    { upsert: true, new: true },
  );

  return res.json({
    message: `${mediaType} ${watched ? 'watched' : 'unwatched'}`,
  });
};

export const addToWatchlist = async (req: Request, res: Response) => {
  const { mediaId, mediaType, watchlist, title, posterPath, voteAverage, voteCount, adult, genreIds, releaseDate } =
    req.body;

  await UserMediaModel.findOneAndUpdate(
    { userId: req.user.id, mediaId, mediaType },
    {
      $set: {
        watchlist,
        title,
        posterPath,
        voteAverage,
        voteCount,
        adult,
        genreIds,
        releaseDate,
      },
    },
    { upsert: true, new: true },
  );

  return res.json({
    message: `${mediaType} ${watchlist ? 'added to watchlist' : 'removed from watchlist'}`,
  });
};
