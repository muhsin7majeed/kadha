import type { MovieDetailsWithMeta, TvDetailsWithMeta } from '@/features/media/media.types';
import { UserMediaPayload } from '../user-media.types';

const getMediaDetailsPayload = (
  media: MovieDetailsWithMeta | TvDetailsWithMeta,
  mediaType: 'movie' | 'tv',
): UserMediaPayload => {
  const isMovie = mediaType === 'movie';
  const title = isMovie ? (media as MovieDetailsWithMeta).title : (media as TvDetailsWithMeta).name;
  const originalTitle = isMovie
    ? (media as MovieDetailsWithMeta).original_title
    : (media as TvDetailsWithMeta).original_name;
  const releaseDate = isMovie
    ? (media as MovieDetailsWithMeta).release_date
    : (media as TvDetailsWithMeta).first_air_date;
  const runtime = isMovie
    ? (media as MovieDetailsWithMeta).runtime
    : (media as TvDetailsWithMeta).episode_run_time?.[0];

  return {
    media_id: media.media_id,
    media_type: media.media_type,
    title,
    original_title: originalTitle,
    overview: media.overview,
    poster_path: media.poster_path,
    backdrop_path: media.backdrop_path,
    vote_average: media.vote_average,
    vote_count: media.vote_count,
    popularity: media.popularity,
    adult: media.adult,
    genre_ids: media.genres.map((genre) => genre.id),
    release_date: releaseDate,
    original_language: media.original_language,
    runtime: runtime ?? null,
    status: media.status,
  };
};

export default getMediaDetailsPayload;
