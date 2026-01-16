import { Media } from '@/types/media';
import { UserMediaPayload } from '@/types/user-media';

const getUserMediaPayload = (media: Media, action: 'liked' | 'watched' | 'watchlist'): UserMediaPayload => {
  return {
    mediaId: media.id,
    mediaType: media.mediaType,
    title: media.title,
    posterPath: media.posterPath,
    voteAverage: media.voteAverage,
    voteCount: media.voteCount,
    adult: media.adult,
    genreIds: media.genreIds,
    releaseDate: media.releaseDate,
    [action]: media[action] ? false : true,
  };
};

export default getUserMediaPayload;
