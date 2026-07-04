import { MovieWithMeta, TvWithMeta } from '@/features/media/media.types';
import { UserMedia } from '@/features/user-media/user-media.types';
import { MediaMeta, MediaType } from '@/types/common';

export interface MediaCardModel extends MediaMeta {
  adult: boolean;
  backdrop_path?: string | null;
  genre_ids: number[];
  media_id: number;
  media_type: MediaType;
  original_language?: string | null;
  original_title?: string | null;
  overview?: string | null;
  popularity?: number | null;
  poster_path: string | null;
  release_date: string;
  runtime?: number | null;
  status?: string | null;
  title: string;
  vote_average: number;
  vote_count: number;
}

export const movieToMediaCardModel = (movie: MovieWithMeta): MediaCardModel => ({
  adult: movie.adult,
  backdrop_path: movie.backdrop_path,
  genre_ids: movie.genre_ids,
  liked: movie.liked,
  media_id: movie.media_id,
  media_type: movie.media_type,
  original_language: movie.original_language,
  original_title: movie.original_title,
  overview: movie.overview,
  popularity: movie.popularity,
  poster_path: movie.poster_path,
  release_date: movie.release_date,
  title: movie.title,
  vote_average: movie.vote_average,
  vote_count: movie.vote_count,
  watched: movie.watched,
  watchlist: movie.watchlist,
});

export const tvToMediaCardModel = (tv: TvWithMeta): MediaCardModel => ({
  adult: tv.adult,
  backdrop_path: tv.backdrop_path,
  genre_ids: tv.genre_ids,
  liked: tv.liked,
  media_id: tv.media_id,
  media_type: tv.media_type,
  original_language: tv.original_language,
  original_title: tv.original_name,
  overview: tv.overview,
  popularity: tv.popularity,
  poster_path: tv.poster_path,
  release_date: tv.first_air_date,
  title: tv.name,
  vote_average: tv.vote_average,
  vote_count: tv.vote_count,
  watched: tv.watched,
  watchlist: tv.watchlist,
});

export const userMediaToMediaCardModel = (media: UserMedia): MediaCardModel => ({
  adult: media.adult,
  backdrop_path: media.backdrop_path,
  genre_ids: media.genre_ids,
  liked: media.liked,
  media_id: media.media_id,
  media_type: media.media_type,
  original_language: media.original_language,
  original_title: media.original_title,
  overview: media.overview,
  popularity: media.popularity,
  poster_path: media.poster_path,
  release_date: media.release_date,
  runtime: media.runtime,
  status: media.status,
  title: media.title,
  vote_average: media.vote_average,
  vote_count: media.vote_count,
  watched: media.watched,
  watchlist: media.watchlist,
});

export const toMediaCardModel = (media: MovieWithMeta | TvWithMeta | UserMedia): MediaCardModel => {
  if ('video' in media) {
    return movieToMediaCardModel(media);
  }

  if ('name' in media) {
    return tvToMediaCardModel(media);
  }

  return userMediaToMediaCardModel(media);
};
