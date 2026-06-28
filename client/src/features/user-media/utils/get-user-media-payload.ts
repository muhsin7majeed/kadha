import { MovieWithMeta, TvWithMeta } from '@/features/media/media.types';
import { UserMediaPayload } from '../user-media.types';

const getUserMediaPayload = (
  media: MovieWithMeta | TvWithMeta,
  action: 'liked' | 'watched' | 'watchlist',
): UserMediaPayload => {
  const title = 'title' in media ? media.title : media.name;
  const releaseDate = 'release_date' in media ? media.release_date : media.first_air_date;

  return {
    media_id: media.media_id,
    media_type: media.media_type,
    title,
    poster_path: media.poster_path,
    vote_average: media.vote_average,
    vote_count: media.vote_count,
    adult: media.adult,
    genre_ids: media.genre_ids,
    release_date: releaseDate,
    [action]: media[action] ? false : true,
  };
};

export default getUserMediaPayload;
