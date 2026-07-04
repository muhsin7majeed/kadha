import { MediaCardModel } from '@/features/media/media-card-model';
import type { MovieDetailsWithMeta, TvDetailsWithMeta } from '@/features/media/media.types';
import { MediaAction, UserMediaPayload } from '@/features/user-media/user-media.types';

type UserMediaPayloadSource = MediaCardModel | MovieDetailsWithMeta | TvDetailsWithMeta;

const buildBasePayload = (media: UserMediaPayloadSource): UserMediaPayload => {
  if ('genres' in media) {
    const title = media.media_type === 'movie' ? media.title : media.name;
    const originalTitle = media.media_type === 'movie' ? media.original_title : media.original_name;
    const releaseDate = media.media_type === 'movie' ? media.release_date : media.first_air_date;
    const runtime = media.media_type === 'movie' ? media.runtime : media.episode_run_time?.[0];

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
  }

  return {
    media_id: media.media_id,
    media_type: media.media_type,
    title: media.title,
    original_title: media.original_title,
    overview: media.overview,
    poster_path: media.poster_path,
    backdrop_path: media.backdrop_path,
    vote_average: media.vote_average,
    vote_count: media.vote_count,
    popularity: media.popularity,
    adult: media.adult,
    genre_ids: media.genre_ids,
    release_date: media.release_date,
    original_language: media.original_language,
    runtime: media.runtime,
    status: media.status,
  };
};

const buildUserMediaPayload = (media: UserMediaPayloadSource, action?: MediaAction): UserMediaPayload => {
  const payload = buildBasePayload(media);

  if (!action) return payload;

  return {
    ...payload,
    [action]: media[action] ? false : true,
  };
};

export default buildUserMediaPayload;
