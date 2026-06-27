import { MovieWithMeta, TvWithMeta } from '@/types/media';

const getUserMediaPayload = (
  media: MovieWithMeta | TvWithMeta,
  action: 'liked' | 'watched' | 'watchlist',
): MovieWithMeta | TvWithMeta => {
  const title = 'title' in media ? media.title : media.name;
  const releaseDate = 'release_date' in media ? media.release_date : media.first_air_date;

  return {
    ...media,
    title,
    release_date: releaseDate,
    [action]: media[action] ? false : true,
  };
};

export default getUserMediaPayload;
