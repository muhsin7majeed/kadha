import { Movie, Tv } from '@/types/media';

const formatTMDBToUserMedia = (media: Movie | Tv) => {
  const title = 'title' in media ? media.title : media.name;
  const releaseDate = 'release_date' in media ? media.release_date : media.first_air_date;

  return {
    id: media.id,
    media_type: media.media_type!,
    title: title,
    poster_path: media.poster_path,
    vote_average: media.vote_average,
    vote_count: media.vote_count,
    adult: media.adult,
    genre_ids: media.genre_ids,
    release_date: releaseDate,
  };
};

export default formatTMDBToUserMedia;
