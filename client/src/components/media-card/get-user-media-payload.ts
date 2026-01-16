import { Media } from '@/types/media';

const getUserMediaPayload = (media: Media, action: 'liked' | 'watched' | 'watchlist'): Media => {
  return {
    mediaId: media.mediaId,
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
