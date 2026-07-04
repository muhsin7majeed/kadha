import { MediaCardModel } from '@/features/media/media-card-model';
import { UserMediaPayload } from '../user-media.types';

const getUserMediaPayload = (
  media: MediaCardModel,
  action?: 'liked' | 'watched' | 'watchlist',
): UserMediaPayload => {
  const payload: UserMediaPayload = {
    media_id: media.media_id,
    media_type: media.media_type,
    title: media.title,
    original_title: media.original_title,
    overview: media.overview,
    poster_path: media.poster_path,
    backdrop_path: media.backdrop_path,
    vote_average: media.vote_average,
    vote_count: media.vote_count,
    popularity: media.popularity,
    adult: media.adult,
    genre_ids: media.genre_ids,
    release_date: media.release_date,
    original_language: media.original_language,
  };

  if (!action) return payload;

  return {
    ...payload,
    [action]: media[action] ? false : true,
  };
};

export default getUserMediaPayload;
