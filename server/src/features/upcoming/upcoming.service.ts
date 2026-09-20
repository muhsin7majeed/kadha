import { MediaType } from '@prisma/client';

import { fetchMediaDetails, fetchTvSeasonDetails } from '@/features/media/tmdb.client';
import type { TMDBMovieDetails, TMDBTvDetails, TMDBTvSeasonEpisode } from '@/features/media/media.types';
import { AppError } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import type { UpcomingQuery } from './upcoming.schema';
import type { UpcomingEntry, UpcomingEpisode, UpcomingMedia, UpcomingResponse } from './upcoming.types';

const PROVIDER_CONCURRENCY = 5;

type TrackedTitle = {
  mediaId: number;
  mediaType: MediaType;
};

const mediaKey = (mediaType: MediaType, mediaId: number) => `${mediaType}:${mediaId}`;
const todayDateOnly = () => new Date().toISOString().slice(0, 10);

const getTrackedTitles = async (userId: string): Promise<TrackedTitle[]> => {
  const [trackedMedia, episodeWatches] = await prisma.$transaction([
    prisma.userMedia.findMany({
      where: {
        userId,
        OR: [
          {
            media_type: MediaType.tv,
            OR: [{ watchlist: true }, { watched: true }, { liked: true }],
          },
          {
            media_type: MediaType.movie,
            watchlist: true,
          },
        ],
      },
      select: { media_id: true, media_type: true },
    }),
    prisma.watchEvent.findMany({
      where: {
        userId,
        media_type: MediaType.tv,
        seasonNumber: { not: null },
        episodeNumber: { not: null },
      },
      distinct: ['media_id'],
      select: { media_id: true },
    }),
  ]);
  const titles = new Map<string, TrackedTitle>();

  for (const item of trackedMedia) {
    titles.set(mediaKey(item.media_type, item.media_id), {
      mediaId: item.media_id,
      mediaType: item.media_type,
    });
  }

  for (const watch of episodeWatches) {
    titles.set(mediaKey(MediaType.tv, watch.media_id), {
      mediaId: watch.media_id,
      mediaType: MediaType.tv,
    });
  }

  return [...titles.values()].sort(
    (left, right) => left.mediaType.localeCompare(right.mediaType) || left.mediaId - right.mediaId,
  );
};

const movieMedia = (details: TMDBMovieDetails): UpcomingMedia => ({
  media_id: details.id,
  media_type: MediaType.movie,
  title: details.title,
  original_title: details.original_title ?? null,
  overview: details.overview ?? null,
  poster_path: details.poster_path ?? null,
  backdrop_path: details.backdrop_path ?? null,
  vote_average: details.vote_average,
  vote_count: details.vote_count,
  popularity: details.popularity ?? null,
  adult: details.adult,
  genre_ids: details.genres.map((genre) => genre.id),
  release_date: details.release_date,
  original_language: details.original_language ?? null,
});

const tvMedia = (details: TMDBTvDetails): UpcomingMedia => ({
  media_id: details.id,
  media_type: MediaType.tv,
  title: details.name,
  original_title: details.original_name ?? null,
  overview: details.overview ?? null,
  poster_path: details.poster_path ?? null,
  backdrop_path: details.backdrop_path ?? null,
  vote_average: details.vote_average,
  vote_count: details.vote_count,
  popularity: details.popularity ?? null,
  adult: details.adult,
  genre_ids: details.genres.map((genre) => genre.id),
  release_date: details.first_air_date,
  original_language: details.original_language ?? null,
});

const episodeModel = (episode: TMDBTvSeasonEpisode): UpcomingEpisode => ({
  seasonNumber: episode.season_number,
  episodeNumber: episode.episode_number,
  episodeId: episode.id,
  name: episode.name || `Episode ${episode.episode_number}`,
});

const resolveMovie = async (mediaId: number, from: string, to: string): Promise<UpcomingEntry[]> => {
  const details = (await fetchMediaDetails('movie', mediaId)) as TMDBMovieDetails;
  const date = details.release_date;

  if (!date || date < from || date > to) return [];

  return [{ kind: 'movie-release', date, media: movieMedia(details) }];
};

const resolveTv = async (mediaId: number, from: string, to: string): Promise<UpcomingEntry[]> => {
  const details = (await fetchMediaDetails('tv', mediaId)) as TMDBTvDetails;
  const nextEpisode = details.next_episode_to_air;

  if (!nextEpisode?.air_date || nextEpisode.season_number <= 0 || nextEpisode.air_date > to) return [];

  const season = await fetchTvSeasonDetails(mediaId, nextEpisode.season_number);
  const episodesByDate = new Map<string, Map<string, UpcomingEpisode>>();

  for (const episode of season.episodes) {
    const date = episode.air_date;
    if (!date || episode.season_number <= 0 || date < from || date > to) continue;

    const episodes = episodesByDate.get(date) ?? new Map<string, UpcomingEpisode>();
    episodes.set(`${episode.season_number}:${episode.episode_number}`, episodeModel(episode));
    episodesByDate.set(date, episodes);
  }

  const media = tvMedia(details);
  return [...episodesByDate.entries()].map(([date, episodes]) => ({
    kind: 'episode-release' as const,
    date,
    media,
    episodes: [...episodes.values()].sort(
      (left, right) => left.seasonNumber - right.seasonNumber || left.episodeNumber - right.episodeNumber,
    ),
  }));
};

const resolveTitle = (title: TrackedTitle, from: string, to: string) =>
  title.mediaType === MediaType.movie
    ? resolveMovie(title.mediaId, from, to)
    : resolveTv(title.mediaId, from, to);

const settleInBatches = async (titles: TrackedTitle[], from: string, to: string) => {
  const results: PromiseSettledResult<UpcomingEntry[]>[] = [];

  for (let index = 0; index < titles.length; index += PROVIDER_CONCURRENCY) {
    const batch = titles.slice(index, index + PROVIDER_CONCURRENCY);
    results.push(...(await Promise.allSettled(batch.map((title) => resolveTitle(title, from, to)))));
  }

  return results;
};

const sortEntries = (entries: UpcomingEntry[]) =>
  entries.sort((left, right) => {
    const dateDifference = left.date.localeCompare(right.date);
    if (dateDifference !== 0) return dateDifference;

    const mediaTypeDifference = left.media.media_type.localeCompare(right.media.media_type);
    if (mediaTypeDifference !== 0) return mediaTypeDifference;

    return left.media.media_id - right.media.media_id;
  });

export const getUpcomingSchedule = async (userId: string, query: UpcomingQuery): Promise<UpcomingResponse> => {
  const titles = await getTrackedTitles(userId);
  const effectiveFrom = query.from < todayDateOnly() ? todayDateOnly() : query.from;
  const results = await settleInBatches(titles, effectiveFrom, query.to);
  const successful = results.filter(
    (result): result is PromiseFulfilledResult<UpcomingEntry[]> => result.status === 'fulfilled',
  );
  const failedTitles = results.length - successful.length;

  if (titles.length > 0 && failedTitles === titles.length) {
    throw new AppError('Unable to refresh upcoming dates', {
      statusCode: 502,
      code: 'UPCOMING_PROVIDER_UNAVAILABLE',
    });
  }

  return {
    entries: sortEntries(successful.flatMap((result) => result.value)),
    coverage: {
      trackedTitles: titles.length,
      resolvedTitles: successful.length,
      failedTitles,
    },
  };
};
