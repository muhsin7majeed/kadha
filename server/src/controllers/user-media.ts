import { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';
import { MediaType } from '@prisma/client';

export const addToLiked = async (req: Request, res: Response) => {
  const {
    id,
    media_id,
    media_type,
    liked,
    title,
    poster_path,
    vote_average,
    vote_count,
    adult,
    genre_ids,
    release_date,
  } = req.body;

  await prisma.userMedia.upsert({
    where: {
      userId_media_id_media_type: {
        userId: req.user.id,
        media_id: media_id,
        media_type: media_type as MediaType,
      },
    },
    update: {
      liked,
      title,
      poster_path,
      vote_average,
      vote_count,
      adult,
      genre_ids: genre_ids ? JSON.stringify(genre_ids) : null,
      release_date,
    },
    create: {
      userId: req.user.id,
      media_id: media_id,
      media_type: media_type as MediaType,
      liked,
      title,
      poster_path,
      vote_average,
      vote_count,
      adult,
      genre_ids: genre_ids ? JSON.stringify(genre_ids) : null,
      release_date,
    },
  });

  return res.json({ message: `${media_type} ${liked ? 'liked' : 'unliked'}` });
};

export const addToWatched = async (req: Request, res: Response) => {
  const {
    id,
    media_id,
    media_type,
    watched,
    title,
    poster_path,
    vote_average,
    vote_count,
    adult,
    genre_ids,
    release_date,
  } = req.body;

  await prisma.userMedia.upsert({
    where: {
      userId_media_id_media_type: {
        userId: req.user.id,
        media_id: media_id,
        media_type: media_type as MediaType,
      },
    },
    update: {
      watched,
      watchlist: false,
      title,
      poster_path,
      vote_average,
      vote_count,
      adult,
      genre_ids: genre_ids ? JSON.stringify(genre_ids) : null,
      release_date,
    },
    create: {
      userId: req.user.id,
      media_id: media_id,
      media_type: media_type as MediaType,
      watched,
      watchlist: false,
      title,
      poster_path,
      vote_average,
      vote_count,
      adult,
      genre_ids: genre_ids ? JSON.stringify(genre_ids) : null,
      release_date,
    },
  });

  // TODO: Check if media needs to be removed from watchlist

  return res.json({
    message: `${media_type} ${watched ? 'watched' : 'unwatched'}`,
  });
};

export const addToWatchlist = async (req: Request, res: Response) => {
  const {
    id,
    media_id,
    media_type,
    watchlist,
    title,
    poster_path,
    vote_average,
    vote_count,
    adult,
    genre_ids,
    release_date,
  } = req.body;

  await prisma.userMedia.upsert({
    where: {
      userId_media_id_media_type: {
        userId: req.user.id,
        media_id: media_id,
        media_type: media_type as MediaType,
      },
    },
    update: {
      watchlist,
      title,
      poster_path,
      vote_average,
      vote_count,
      adult,
      genre_ids: genre_ids ? JSON.stringify(genre_ids) : null,
      release_date,
    },
    create: {
      userId: req.user.id,
      media_id: media_id,
      media_type: media_type as MediaType,
      watchlist,
      title,
      poster_path,
      vote_average,
      vote_count,
      adult,
      genre_ids: genre_ids ? JSON.stringify(genre_ids) : null,
      release_date,
    },
  });

  return res.json({
    message: `${media_type} ${watchlist ? 'added to watchlist' : 'removed from watchlist'}`,
  });
};
