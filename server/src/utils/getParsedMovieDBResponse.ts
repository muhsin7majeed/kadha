import { Media, MediaDetails, MediaType } from '@/types/media';
import { MovieDBResponse, TMDBMovie, TMDBMovieDetails, TMDBTv, TMDBTvDetails } from '@/types/themoviedb';

export const getParsedMovieDBResponse = (media: MovieDBResponse['results']): Media[] => {
  if (media.length === 0) return [];

  return media.map((item) => {
    const isMovie = item.media_type === 'movie';
    const isTv = item.media_type === 'tv';

    return {
      id: item.id,
      posterPath: item.poster_path,
      voteAverage: item.vote_average,
      voteCount: item.vote_count,
      adult: item.adult,
      genreIds: item.genre_ids,
      mediaType: item.media_type as MediaType,
      title: isMovie ? item.title : (item as TMDBTv).name,
      releaseDate: isMovie ? item.release_date : undefined,
      firstAirDate: isTv ? item.first_air_date : undefined,
    };
  });
};

export const getParsedMovieDBDetailsResponse = (media: TMDBMovieDetails | TMDBTvDetails): MediaDetails => {
  const isMovie = media.media_type === 'movie';
  const isTv = media.media_type === 'tv';

  return {
    id: media.id,
    backDropPath: media.backdrop_path,
    genres: media.genres,
    runtime: isMovie ? media.runtime : null,
    tagline: media.tagline,
    overview: media.overview,
    posterPath: media.poster_path,
    voteAverage: media.vote_average,
    voteCount: media.vote_count,
    adult: media.adult,
    mediaType: media.media_type as MediaType,
    title: isMovie ? media.title : (media as TMDBTvDetails).name,
    releaseDate: isMovie ? media.release_date : undefined,
    firstAirDate: isTv ? media.first_air_date : undefined,
  };
};
