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

const getTrackingMeta = (media: MediaMeta): MediaMeta => ({
  liked: media.liked,
  watched: media.watched,
  watchlist: media.watchlist,
  rating: media.rating,
  ratedAt: media.ratedAt,
  watchedOn: media.watchedOn,
  likedNote: media.likedNote,
  watchedNote: media.watchedNote,
  watchlistNote: media.watchlistNote,
  watchCount: media.watchCount,
});

export const movieToMediaCardModel = (movie: MovieWithMeta): MediaCardModel => ({
  adult: movie.adult,
  backdrop_path: movie.backdrop_path,
  genre_ids: movie.genre_ids,
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
  ...getTrackingMeta(movie),
});

export const tvToMediaCardModel = (tv: TvWithMeta): MediaCardModel => ({
  adult: tv.adult,
  backdrop_path: tv.backdrop_path,
  genre_ids: tv.genre_ids,
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
  ...getTrackingMeta(tv),
});

export const userMediaToMediaCardModel = (media: UserMedia): MediaCardModel => ({
  adult: media.adult,
  backdrop_path: media.backdrop_path,
  genre_ids: media.genre_ids,
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
  ...getTrackingMeta(media),
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
