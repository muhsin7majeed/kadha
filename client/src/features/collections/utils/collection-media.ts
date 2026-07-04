import { CollectionMedia } from '@/features/collections/collections.types';
import { MediaCardModel } from '@/features/media/media-card-model';

export const parseCollectionGenreIds = (genreIds: number[] | string | null | undefined): number[] => {
  if (Array.isArray(genreIds)) return genreIds;
  if (!genreIds) return [];

  try {
    const parsed = JSON.parse(genreIds) as unknown;
    return Array.isArray(parsed) ? parsed.filter((genreId): genreId is number => typeof genreId === 'number') : [];
  } catch {
    return [];
  }
};

export const collectionMediaToMediaCardModel = (media: CollectionMedia): MediaCardModel => ({
  adult: media.adult,
  backdrop_path: media.backdrop_path,
  genre_ids: parseCollectionGenreIds(media.genre_ids),
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
