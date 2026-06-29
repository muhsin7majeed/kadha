import { Movie, Tv } from '@/features/media/media.types';
import { UserMediaPayload } from '../user-media.types';

const formatTMDBToUserMedia = (media: Movie | Tv): UserMediaPayload => {
  const title = 'title' in media ? media.title : media.name;
  const originalTitle = 'original_title' in media ? media.original_title : media.original_name;
  const releaseDate = 'release_date' in media ? media.release_date : media.first_air_date;

  return {
    media_id: media.media_id,
    media_type: media.media_type,
    title: title,
    original_title: originalTitle,
    overview: media.overview,
    poster_path: media.poster_path,
    backdrop_path: media.backdrop_path,
    vote_average: media.vote_average,
    vote_count: media.vote_count,
    popularity: media.popularity,
    adult: media.adult,
    genre_ids: media.genre_ids,
    release_date: releaseDate,
    original_language: media.original_language,
  };
};

export default formatTMDBToUserMedia;
