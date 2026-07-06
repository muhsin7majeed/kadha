import { MediaType, Prisma } from '@prisma/client';

import { fetchMediaDetails, fetchTvSeasonDetails } from '@/features/media/tmdb.client';
import { TMDBSeason, TMDBTvDetails, TMDBTvSeasonDetails, TMDBTvSeasonEpisode } from '@/features/media/media.types';
import { upsertMediaSnapshot } from '@/features/media/media-snapshot.service';
import { badRequest } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { EpisodeWatchPayload } from './user-media.schema';
import { formatWatchedOnForApi } from './user-media.serializer';
import {
  TvProgressEpisode,
  TvProgressNextEpisode,
  TvProgressResponse,
  TvProgressSeason,
  TvProgressSelectedSeason,
  TvProgressStatus,
} from './tv-progress.types';

const TV_MEDIA_TYPE = MediaType.tv;

type ProgressDb = Pick<Prisma.TransactionClient, 'mediaSnapshot' | 'userMedia' | 'userEpisodeWatch'>;
type EpisodeWatchRow = {
  seasonNumber: number;
  episodeNumber: number;
  episodeId: number | null;
  watchedAt: Date;
  watchedOn: Date | null;
  rating: number | null;
  note: string | null;
};

interface TvProgressOptions {
  selectedSeasonNumber?: number;
  includeSpecials?: boolean;
}

const todayDateOnly = () => new Date().toISOString().slice(0, 10);

const parsePositiveInt = (value: string, label: string) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw badRequest(`${label} must be a positive integer`);
  }

  return parsed;
};

const parseSeasonNumber = (value: string) => {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw badRequest('Season number must be zero or greater');
  }

  return parsed;
};

const parseEpisodeNumber = (value: string) => parsePositiveInt(value, 'Episode number');

const normalizeNote = (value: EpisodeWatchPayload['note']) => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return value ?? null;
};

const normalizeWatchedOnForStorage = (value: EpisodeWatchPayload['watchedOn']) => {
  if (value === null) return null;
  if (!value) return undefined;

  return new Date(`${value}T00:00:00.000Z`);
};

const hasPayloadKey = <Key extends keyof EpisodeWatchPayload>(payload: Partial<EpisodeWatchPayload>, key: Key) =>
  Object.prototype.hasOwnProperty.call(payload, key);

const getTvDetails = async (mediaId: number): Promise<TMDBTvDetails> => {
  const details = await fetchMediaDetails('tv', mediaId);

  return details as TMDBTvDetails;
};

const getProgressSeasons = (details: TMDBTvDetails, includeSpecials = false) =>
  details.seasons.filter((season) => includeSpecials || season.season_number > 0);

const getSeasonAiredCount = (season: TMDBSeason, details: TMDBTvDetails, today = todayDateOnly()) => {
  if (!season.air_date || season.air_date > today) return 0;

  const lastEpisode = details.last_episode_to_air;

  if (lastEpisode) {
    if (season.season_number < lastEpisode.season_number) return season.episode_count;
    if (season.season_number === lastEpisode.season_number) {
      return Math.min(season.episode_count, lastEpisode.episode_number);
    }

    return 0;
  }

  return details.in_production ? 0 : season.episode_count;
};

const isShowEnded = (details: TMDBTvDetails) => !details.in_production && details.status.toLowerCase() === 'ended';

const getEpisodeKey = (seasonNumber: number, episodeNumber: number) => `${seasonNumber}:${episodeNumber}`;

const getWatchedEpisodeMap = (watches: EpisodeWatchRow[]) => {
  const map = new Map<string, EpisodeWatchRow>();

  watches.forEach((watch) => {
    map.set(getEpisodeKey(watch.seasonNumber, watch.episodeNumber), watch);
  });

  return map;
};

const getTvMediaSnapshotPayload = (mediaId: number, details: TMDBTvDetails) => ({
  media_id: mediaId,
  media_type: TV_MEDIA_TYPE,
  title: details.name,
  original_title: details.original_name,
  overview: details.overview,
  poster_path: details.poster_path,
  backdrop_path: details.backdrop_path,
  vote_average: details.vote_average,
  vote_count: details.vote_count,
  popularity: details.popularity,
  adult: details.adult,
  genre_ids: details.genres.map((genre) => genre.id),
  release_date: details.first_air_date,
  original_language: details.original_language,
  runtime: details.episode_run_time[0] ?? null,
  status: details.status,
});

const ensureTvUserMedia = async (
  userId: string,
  mediaId: number,
  details: TMDBTvDetails,
  tx: ProgressDb,
  clearWatchlist = true,
) => {
  await upsertMediaSnapshot(getTvMediaSnapshotPayload(mediaId, details), tx);

  return tx.userMedia.upsert({
    where: {
      userId_media_id_media_type: {
        userId,
        media_id: mediaId,
        media_type: TV_MEDIA_TYPE,
      },
    },
    update: clearWatchlist
      ? {
          watchlist: false,
          watchlistAt: null,
        }
      : {},
    create: {
      userId,
      media_id: mediaId,
      media_type: TV_MEDIA_TYPE,
      watchlist: false,
    },
  });
};

const buildSeasonSummaries = (
  details: TMDBTvDetails,
  watches: EpisodeWatchRow[],
  includeSpecials = false,
): TvProgressSeason[] => {
  const watchedMap = getWatchedEpisodeMap(watches);

  return getProgressSeasons(details, includeSpecials).map((season) => {
    const airedCount = getSeasonAiredCount(season, details);
    const watchedCount = Array.from({ length: airedCount }, (_, index) => index + 1).filter((episodeNumber) =>
      watchedMap.has(getEpisodeKey(season.season_number, episodeNumber)),
    ).length;

    return {
      seasonNumber: season.season_number,
      name: season.name,
      watchedCount,
      airedCount,
      totalCount: season.episode_count,
    };
  });
};

const getWatchedAiredEpisodeCount = (seasonSummaries: TvProgressSeason[]) =>
  seasonSummaries.reduce((count, season) => count + season.watchedCount, 0);

const getTotalAiredEpisodeCount = (seasonSummaries: TvProgressSeason[]) =>
  seasonSummaries.reduce((count, season) => count + season.airedCount, 0);

const deriveStatus = (
  watchedEpisodeCount: number,
  totalAiredEpisodeCount: number,
  watchlist: boolean,
  details: TMDBTvDetails,
): TvProgressStatus => {
  if (watchedEpisodeCount === 0) {
    return watchlist ? 'plan_to_watch' : 'not_started';
  }

  if (watchedEpisodeCount < totalAiredEpisodeCount) {
    return 'in_progress';
  }

  return isShowEnded(details) ? 'completed' : 'caught_up';
};

const getEpisodeFromSeasonDetails = (
  seasonDetails: TMDBTvSeasonDetails,
  episodeNumber: number,
): TMDBTvSeasonEpisode | undefined =>
  seasonDetails.episodes.find((episode) => episode.episode_number === episodeNumber);

const isEpisodeAired = (episode: TMDBTvSeasonEpisode, seasonAiredCount: number, today = todayDateOnly()) => {
  if (episode.air_date) return episode.air_date <= today;

  return episode.episode_number <= seasonAiredCount;
};

const findNextUnwatchedEpisode = async (
  mediaId: number,
  seasonSummaries: TvProgressSeason[],
  watches: EpisodeWatchRow[],
): Promise<TvProgressNextEpisode | null> => {
  const watchedMap = getWatchedEpisodeMap(watches);

  for (const season of seasonSummaries) {
    for (let episodeNumber = 1; episodeNumber <= season.airedCount; episodeNumber += 1) {
      if (!watchedMap.has(getEpisodeKey(season.seasonNumber, episodeNumber))) {
        const seasonDetails = await fetchTvSeasonDetails(mediaId, season.seasonNumber);
        const episode = getEpisodeFromSeasonDetails(seasonDetails, episodeNumber);

        return {
          seasonNumber: season.seasonNumber,
          episodeNumber,
          episodeId: episode?.id ?? null,
          name: episode?.name || `Episode ${episodeNumber}`,
          airDate: episode?.air_date ?? null,
        };
      }
    }
  }

  return null;
};

const buildSelectedSeason = async (
  mediaId: number,
  details: TMDBTvDetails,
  seasonNumber: number,
  watches: EpisodeWatchRow[],
): Promise<TvProgressSelectedSeason> => {
  const seasonDetails = await fetchTvSeasonDetails(mediaId, seasonNumber);
  const watchedMap = getWatchedEpisodeMap(watches);
  const seasonSummary = buildSeasonSummaries(details, watches, true).find((season) => season.seasonNumber === seasonNumber);

  return {
    seasonNumber: seasonDetails.season_number,
    name: seasonDetails.name,
    episodes: seasonDetails.episodes.map<TvProgressEpisode>((episode) => {
      const watch = watchedMap.get(getEpisodeKey(episode.season_number, episode.episode_number));

      return {
        seasonNumber: episode.season_number,
        episodeNumber: episode.episode_number,
        episodeId: episode.id,
        name: episode.name || `Episode ${episode.episode_number}`,
        airDate: episode.air_date ?? null,
        watched: Boolean(watch),
        watchedAt: watch?.watchedAt.toISOString() ?? null,
        watchedOn: formatWatchedOnForApi(watch?.watchedOn),
        rating: watch?.rating ?? null,
        note: watch?.note ?? null,
        isAired: isEpisodeAired(episode, seasonSummary?.airedCount ?? 0),
      };
    }),
  };
};

export async function getTvProgress(userId: string, mediaIdValue: string, options: TvProgressOptions = {}) {
  const mediaId = parsePositiveInt(mediaIdValue, 'Media ID');
  if (
    options.selectedSeasonNumber !== undefined &&
    (!Number.isInteger(options.selectedSeasonNumber) || options.selectedSeasonNumber < 0)
  ) {
    throw badRequest('Season number must be zero or greater');
  }

  const details = await getTvDetails(mediaId);

  const [userMedia, watches] = await prisma.$transaction([
    prisma.userMedia.findUnique({
      where: {
        userId_media_id_media_type: {
          userId,
          media_id: mediaId,
          media_type: TV_MEDIA_TYPE,
        },
      },
      select: {
        watchlist: true,
      },
    }),
    prisma.userEpisodeWatch.findMany({
      where: {
        userId,
        media_id: mediaId,
        media_type: TV_MEDIA_TYPE,
      },
      orderBy: [{ seasonNumber: 'asc' }, { episodeNumber: 'asc' }],
      select: {
        seasonNumber: true,
        episodeNumber: true,
        episodeId: true,
        watchedAt: true,
        watchedOn: true,
        rating: true,
        note: true,
      },
    }),
  ]);

  const seasons = buildSeasonSummaries(details, watches, options.includeSpecials);
  const watchedEpisodeCount = getWatchedAiredEpisodeCount(seasons);
  const totalAiredEpisodeCount = getTotalAiredEpisodeCount(seasons);
  const nextEpisode = await findNextUnwatchedEpisode(mediaId, seasons, watches);
  const response: TvProgressResponse = {
    status: deriveStatus(watchedEpisodeCount, totalAiredEpisodeCount, Boolean(userMedia?.watchlist), details),
    watchedEpisodeCount,
    totalAiredEpisodeCount,
    nextEpisode,
    seasons,
  };

  if (options.selectedSeasonNumber !== undefined) {
    response.selectedSeason = await buildSelectedSeason(mediaId, details, options.selectedSeasonNumber, watches);
  }

  return response;
}

const getAiredEpisodesForSeason = async (mediaId: number, details: TMDBTvDetails, seasonNumber: number) => {
  const seasonSummary = buildSeasonSummaries(details, [], true).find((season) => season.seasonNumber === seasonNumber);

  if (!seasonSummary) {
    throw badRequest('Season not found');
  }

  const seasonDetails = await fetchTvSeasonDetails(mediaId, seasonNumber);

  return seasonDetails.episodes.filter((episode) => isEpisodeAired(episode, seasonSummary.airedCount));
};

const upsertEpisodeWatch = (
  tx: ProgressDb,
  userId: string,
  mediaId: number,
  episode: Pick<TMDBTvSeasonEpisode, 'episode_number' | 'id' | 'season_number'>,
  payload: Partial<Pick<EpisodeWatchPayload, 'rating' | 'note' | 'watchedOn'>> = {},
) => {
  const updateData: Prisma.UserEpisodeWatchUncheckedUpdateInput = {
    episodeId: episode.id,
    watchedAt: new Date(),
  };
  const createData: Prisma.UserEpisodeWatchUncheckedCreateInput = {
    userId,
    media_id: mediaId,
    media_type: TV_MEDIA_TYPE,
    seasonNumber: episode.season_number,
    episodeNumber: episode.episode_number,
    episodeId: episode.id,
  };

  if (hasPayloadKey(payload, 'watchedOn')) {
    const watchedOn = normalizeWatchedOnForStorage(payload.watchedOn);
    updateData.watchedOn = watchedOn;
    createData.watchedOn = watchedOn;
  }

  if (hasPayloadKey(payload, 'rating')) {
    updateData.rating = payload.rating ?? null;
    createData.rating = payload.rating ?? null;
  }

  if (hasPayloadKey(payload, 'note')) {
    updateData.note = normalizeNote(payload.note);
    createData.note = normalizeNote(payload.note);
  }

  return tx.userEpisodeWatch.upsert({
    where: {
      userId_media_id_media_type_seasonNumber_episodeNumber: {
        userId,
        media_id: mediaId,
        media_type: TV_MEDIA_TYPE,
        seasonNumber: episode.season_number,
        episodeNumber: episode.episode_number,
      },
    },
    update: updateData,
    create: createData,
  });
};

export async function markEpisodeWatched(userId: string, mediaIdValue: string, payload: EpisodeWatchPayload) {
  const mediaId = parsePositiveInt(mediaIdValue, 'Media ID');
  const details = await getTvDetails(mediaId);
  const airedEpisodes = await getAiredEpisodesForSeason(mediaId, details, payload.seasonNumber);
  const episode = airedEpisodes.find((item) => item.episode_number === payload.episodeNumber);

  if (!episode) {
    throw badRequest('Episode has not aired yet');
  }

  await prisma.$transaction(async (tx) => {
    await ensureTvUserMedia(userId, mediaId, details, tx);
    await upsertEpisodeWatch(tx, userId, mediaId, episode, payload);
  });

  return getTvProgress(userId, mediaIdValue, { selectedSeasonNumber: payload.seasonNumber });
}

export async function clearEpisodeWatched(
  userId: string,
  mediaIdValue: string,
  seasonNumberValue: string,
  episodeNumberValue: string,
) {
  const mediaId = parsePositiveInt(mediaIdValue, 'Media ID');
  const seasonNumber = parseSeasonNumber(seasonNumberValue);
  const episodeNumber = parseEpisodeNumber(episodeNumberValue);

  await prisma.userEpisodeWatch.deleteMany({
    where: {
      userId,
      media_id: mediaId,
      media_type: TV_MEDIA_TYPE,
      seasonNumber,
      episodeNumber,
    },
  });

  return getTvProgress(userId, mediaIdValue, { selectedSeasonNumber: seasonNumber });
}

export async function markSeasonWatched(userId: string, mediaIdValue: string, seasonNumberValue: string) {
  const mediaId = parsePositiveInt(mediaIdValue, 'Media ID');
  const seasonNumber = parseSeasonNumber(seasonNumberValue);
  const details = await getTvDetails(mediaId);
  const airedEpisodes = await getAiredEpisodesForSeason(mediaId, details, seasonNumber);

  await prisma.$transaction(async (tx) => {
    await ensureTvUserMedia(userId, mediaId, details, tx);

    for (const episode of airedEpisodes) {
      await upsertEpisodeWatch(tx, userId, mediaId, episode);
    }
  });

  return getTvProgress(userId, mediaIdValue, { selectedSeasonNumber: seasonNumber });
}

export async function clearSeasonWatched(userId: string, mediaIdValue: string, seasonNumberValue: string) {
  const mediaId = parsePositiveInt(mediaIdValue, 'Media ID');
  const seasonNumber = parseSeasonNumber(seasonNumberValue);

  await prisma.userEpisodeWatch.deleteMany({
    where: {
      userId,
      media_id: mediaId,
      media_type: TV_MEDIA_TYPE,
      seasonNumber,
    },
  });

  return getTvProgress(userId, mediaIdValue, { selectedSeasonNumber: seasonNumber });
}

export async function markAllAiredWatched(userId: string, mediaIdValue: string) {
  const mediaId = parsePositiveInt(mediaIdValue, 'Media ID');
  const details = await getTvDetails(mediaId);
  const seasons = buildSeasonSummaries(details, [], false).filter((season) => season.airedCount > 0);

  await prisma.$transaction(async (tx) => {
    await ensureTvUserMedia(userId, mediaId, details, tx);

    for (const season of seasons) {
      for (let episodeNumber = 1; episodeNumber <= season.airedCount; episodeNumber += 1) {
        await tx.userEpisodeWatch.upsert({
          where: {
            userId_media_id_media_type_seasonNumber_episodeNumber: {
              userId,
              media_id: mediaId,
              media_type: TV_MEDIA_TYPE,
              seasonNumber: season.seasonNumber,
              episodeNumber,
            },
          },
          update: {
            watchedAt: new Date(),
          },
          create: {
            userId,
            media_id: mediaId,
            media_type: TV_MEDIA_TYPE,
            seasonNumber: season.seasonNumber,
            episodeNumber,
          },
        });
      }
    }
  });

  return getTvProgress(userId, mediaIdValue);
}

export async function markNextEpisodeWatched(userId: string, mediaIdValue: string) {
  const progress = await getTvProgress(userId, mediaIdValue);

  if (!progress.nextEpisode) {
    return progress;
  }

  return markEpisodeWatched(userId, mediaIdValue, {
    seasonNumber: progress.nextEpisode.seasonNumber,
    episodeNumber: progress.nextEpisode.episodeNumber,
    episodeId: progress.nextEpisode.episodeId,
  });
}
