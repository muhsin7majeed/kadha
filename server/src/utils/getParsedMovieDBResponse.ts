import { Media, MediaDetails, MediaType } from '@/types/media';
import { MovieDBResponse, TMDBMovie, TMDBMovieDetails, TMDBTv, TMDBTvDetails } from '@/types/themoviedb';

export const getParsedMovieDBResponse = (media: MovieDBResponse['results']): Media[] => {
  if (media.length === 0) return [];

  return media.map((item) => {
    const mediaType = item.media_type || (item as TMDBMovie).title ? 'movie' : 'tv';

    const title = (item as TMDBMovie).title || (item as TMDBTv).name;
    const releaseDate = (item as TMDBMovie).release_date || (item as TMDBTv).first_air_date;
    const firstAirDate = (item as TMDBTv).first_air_date;

    return {
      id: item.id,
      posterPath: item.poster_path,
      voteAverage: item.vote_average,
      voteCount: item.vote_count,
      adult: item.adult,
      genreIds: item.genre_ids,
      mediaType,
      title,
      releaseDate,
      firstAirDate,
    };
  });
};

export const getParsedMovieDBDetailsResponse = (media: TMDBMovieDetails | TMDBTvDetails): MediaDetails => {
  const mediaType = media.media_type || (media as TMDBMovieDetails).title ? 'movie' : 'tv';

  const title = (media as TMDBMovieDetails).title || (media as TMDBTvDetails).name;
  const releaseDate = (media as TMDBMovieDetails).release_date || (media as TMDBTvDetails).first_air_date;
  const firstAirDate = (media as TMDBTvDetails).first_air_date;
  const totalRuntime =
    mediaType === 'movie'
      ? (media as TMDBMovieDetails).runtime
      : (media as TMDBTvDetails).episode_run_time.reduce((acc, curr) => acc + curr, 0);
  const backDropPath =
    mediaType === 'movie' ? (media as TMDBMovieDetails).backdrop_path : (media as TMDBTvDetails).still_path;

  return {
    id: media.id,
    backDropPath,
    genres: media.genres,
    runtime: totalRuntime,
    tagline: media.tagline,
    overview: media.overview,
    posterPath: media.poster_path,
    voteAverage: media.vote_average,
    voteCount: media.vote_count,
    adult: media.adult,
    mediaType: media.media_type as MediaType,
    title,
    releaseDate,
    firstAirDate,
  };
};
