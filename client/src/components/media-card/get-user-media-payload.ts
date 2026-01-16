import { Movie, Tv } from '@/types/media';
import { UserMediaPayload } from '@/types/user-media';

const getUserMediaPayload = (media: Movie | Tv): UserMediaPayload => {
  return {
    mediaId: media.id,
    mediaType: media.media_type,
    title: media.media_type === 'movie' ? (media as Movie).title : (media as Tv).name,
    posterPath: media.poster_path,
    voteAverage: media.vote_average,
    voteCount: media.vote_count,
    adult: media.adult,
    genreIds: media.genre_ids,
    releaseDate: media.media_type === 'movie' ? (media as Movie).release_date : (media as Tv).first_air_date,
  };
};

export default getUserMediaPayload;
