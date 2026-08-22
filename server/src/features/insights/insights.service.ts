import { MediaCreditKind, MediaMetadataStatus, MediaType, Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import {
  InsightCoverage,
  InsightDistributionItem,
  InsightMediaType,
  InsightRankingItem,
  ViewingInsights,
} from './insights.types';

const TOP_RANKING_LIMIT = 5;
const CAST_BILLING_LIMIT = 10;
const VIEWING_SIGNATURE_MINIMUM = 5;
const HIGHEST_RATED_GENRE_MINIMUM = 3;

const mediaDimensionsSelect = {
  id: true,
  title: true,
  release_date: true,
  original_language: true,
  runtime: true,
  metadataStatus: true,
  genres: {
    select: {
      genre: { select: { id: true, name: true } },
    },
  },
  credits: {
    where: {
      OR: [
        { kind: MediaCreditKind.CAST, billingOrder: { lt: CAST_BILLING_LIMIT } },
        { kind: MediaCreditKind.CREW, job: 'Director' },
        { kind: MediaCreditKind.CREATOR },
      ],
    },
    select: {
      kind: true,
      job: true,
      billingOrder: true,
      person: { select: { id: true, name: true, profilePath: true } },
    },
  },
} satisfies Prisma.MediaSnapshotSelect;

interface CounterValue {
  id: string;
  label: string;
  value: number;
  imagePath?: string | null;
}

interface RatingCounterValue extends CounterValue {
  totalRating: number;
}

const getMediaTypeWhere = (mediaType: InsightMediaType): Prisma.UserMediaWhereInput =>
  mediaType === 'all' ? {} : { media_type: mediaType as MediaType };

const getEpisodeMediaTypeWhere = (mediaType: InsightMediaType): Prisma.UserEpisodeWatchWhereInput =>
  mediaType === 'movie' ? { media_type: MediaType.movie } : { media_type: MediaType.tv };

const incrementCounter = (counter: Map<string, CounterValue>, id: string, label: string, imagePath?: string | null) => {
  const existing = counter.get(id);

  counter.set(id, {
    id,
    label,
    imagePath: imagePath ?? existing?.imagePath,
    value: (existing?.value ?? 0) + 1,
  });
};

const incrementRatingCounter = (
  counter: Map<string, RatingCounterValue>,
  id: string,
  label: string,
  rating: number,
) => {
  const existing = counter.get(id);

  counter.set(id, {
    id,
    label,
    value: (existing?.value ?? 0) + 1,
    totalRating: (existing?.totalRating ?? 0) + rating,
  });
};

const sortCounters = <T extends CounterValue>(values: T[]) =>
  values.sort(
    (left, right) =>
      right.value - left.value || left.label.localeCompare(right.label) || left.id.localeCompare(right.id),
  );

const toRanking = (counter: Map<string, CounterValue>, denominator: number): InsightRankingItem[] =>
  sortCounters([...counter.values()])
    .slice(0, TOP_RANKING_LIMIT)
    .map((item, index) => ({
      id: item.id,
      label: item.label,
      rank: index + 1,
      value: item.value,
      unit: 'titles',
      denominator,
      share: denominator > 0 ? item.value / denominator : 0,
      sampleSize: denominator,
      ...(item.imagePath !== undefined ? { imagePath: item.imagePath } : {}),
    }));

const toHighestRatedRanking = (counter: Map<string, RatingCounterValue>): InsightRankingItem[] =>
  [...counter.values()]
    .filter((item) => item.value >= HIGHEST_RATED_GENRE_MINIMUM)
    .sort(
      (left, right) =>
        right.totalRating / right.value - left.totalRating / left.value ||
        right.value - left.value ||
        left.label.localeCompare(right.label) ||
        left.id.localeCompare(right.id),
    )
    .slice(0, TOP_RANKING_LIMIT)
    .map((item, index) => ({
      id: item.id,
      label: item.label,
      rank: index + 1,
      value: Number((item.totalRating / item.value).toFixed(1)),
      unit: 'rating',
      denominator: item.value,
      share: 0,
      sampleSize: item.value,
    }));

const getCoverage = (coveredTitleCount: number, eligibleTitleCount: number): InsightCoverage => {
  const ratio = eligibleTitleCount > 0 ? coveredTitleCount / eligibleTitleCount : 0;

  return {
    coveredTitleCount,
    ratio,
    status:
      eligibleTitleCount === 0 || coveredTitleCount === 0
        ? 'UNAVAILABLE'
        : coveredTitleCount === eligibleTitleCount
          ? 'COMPLETE'
          : 'PARTIAL',
  };
};

const getDistribution = (counter: Map<string, CounterValue>, denominator: number): InsightDistributionItem[] =>
  sortCounters([...counter.values()]).map((item) => ({
    key: item.id,
    label: item.label,
    value: item.value,
    unit: 'titles',
    share: denominator > 0 ? item.value / denominator : 0,
  }));

const getDecade = (releaseDate: string | null) => {
  const year = Number(releaseDate?.slice(0, 4));
  if (!Number.isInteger(year) || year < 1880) return null;

  const decade = Math.floor(year / 10) * 10;
  return { key: String(decade), label: `${decade}s` };
};

const getLanguageLabel = (language: string) => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(language) ?? language.toUpperCase();
  } catch {
    return language.toUpperCase();
  }
};

export const getViewingInsights = async (userId: string, mediaType: InsightMediaType): Promise<ViewingInsights> => {
  const episodeGroups = await prisma.userEpisodeWatch.groupBy({
    by: ['media_id', 'media_type'],
    where: {
      userId,
      ...getEpisodeMediaTypeWhere(mediaType),
    },
    _count: { _all: true },
  });
  const watchedEpisodesByMedia = new Map(
    episodeGroups.map((group) => [`${group.media_type}:${group.media_id}`, group._count._all]),
  );
  const episodeMediaIds = episodeGroups.map((group) => group.media_id);
  const mediaRows = await prisma.userMedia.findMany({
    where: {
      userId,
      ...getMediaTypeWhere(mediaType),
      OR: [
        { watched: true },
        { liked: true },
        { rating: { not: null } },
        ...(mediaType === 'movie' || episodeMediaIds.length === 0
          ? []
          : [{ media_type: MediaType.tv, media_id: { in: episodeMediaIds } }]),
      ],
    },
    select: {
      media_id: true,
      media_type: true,
      watched: true,
      liked: true,
      rating: true,
      media: { select: mediaDimensionsSelect },
    },
  });

  const watchedRows = mediaRows.filter(
    (row) => row.watched || (watchedEpisodesByMedia.get(`${row.media_type}:${row.media_id}`) ?? 0) > 0,
  );
  const eligibleTitleCount = watchedRows.length;
  const genreCounter = new Map<string, CounterValue>();
  const castCounter = new Map<string, CounterValue>();
  const directorCounter = new Map<string, CounterValue>();
  const creatorCounter = new Map<string, CounterValue>();
  const likedGenreCounter = new Map<string, CounterValue>();
  const ratedGenreCounter = new Map<string, RatingCounterValue>();
  const mediaTypeCounter = new Map<string, CounterValue>();
  const decadeCounter = new Map<string, CounterValue>();
  const languageCounter = new Map<string, CounterValue>();
  let genreCoveredTitleCount = 0;
  let creditCoveredTitleCount = 0;
  let runtimeCoveredTitleCount = 0;
  let totalRating = 0;
  let ratingSampleSize = 0;

  for (const row of watchedRows) {
    const titleGenres = row.media.genres.map(({ genre }) => genre);
    const uniqueTitlePeople = new Set<string>();

    if (titleGenres.length > 0) genreCoveredTitleCount += 1;
    if (row.media.metadataStatus === MediaMetadataStatus.READY) creditCoveredTitleCount += 1;
    if (row.media.runtime !== null) runtimeCoveredTitleCount += 1;

    for (const genre of titleGenres) {
      incrementCounter(genreCounter, String(genre.id), genre.name);
      if (row.rating !== null) incrementRatingCounter(ratedGenreCounter, String(genre.id), genre.name, row.rating);
    }

    for (const credit of row.media.credits) {
      const personKey = `${credit.kind}:${credit.person.id}`;
      if (uniqueTitlePeople.has(personKey)) continue;

      const isEligibleCast =
        credit.kind === MediaCreditKind.CAST &&
        credit.billingOrder !== null &&
        credit.billingOrder < CAST_BILLING_LIMIT;
      const isMovieDirector =
        row.media_type === MediaType.movie && credit.kind === MediaCreditKind.CREW && credit.job === 'Director';
      const isTvCreator = row.media_type === MediaType.tv && credit.kind === MediaCreditKind.CREATOR;

      if (isEligibleCast) {
        incrementCounter(castCounter, String(credit.person.id), credit.person.name, credit.person.profilePath);
        uniqueTitlePeople.add(personKey);
      } else if (isMovieDirector) {
        incrementCounter(directorCounter, String(credit.person.id), credit.person.name, credit.person.profilePath);
        uniqueTitlePeople.add(personKey);
      } else if (isTvCreator) {
        incrementCounter(creatorCounter, String(credit.person.id), credit.person.name, credit.person.profilePath);
        uniqueTitlePeople.add(personKey);
      }
    }

    const typeLabel = row.media_type === MediaType.movie ? 'Movies' : 'TV shows';
    incrementCounter(mediaTypeCounter, row.media_type, typeLabel);

    const decade = getDecade(row.media.release_date);
    if (decade) incrementCounter(decadeCounter, decade.key, decade.label);

    if (row.media.original_language) {
      incrementCounter(languageCounter, row.media.original_language, getLanguageLabel(row.media.original_language));
    }

    if (row.rating !== null) {
      totalRating += row.rating;
      ratingSampleSize += 1;
    }
  }

  const likedRows = mediaRows.filter((row) => row.liked);
  for (const row of likedRows) {
    for (const { genre } of row.media.genres) {
      incrementCounter(likedGenreCounter, String(genre.id), genre.name);
    }
  }

  const genres = toRanking(genreCounter, genreCoveredTitleCount);
  const cast = toRanking(castCounter, creditCoveredTitleCount);
  const movieDirectors = toRanking(
    directorCounter,
    watchedRows.filter((row) => row.media_type === MediaType.movie).length,
  );
  const tvCreators = toRanking(creatorCounter, watchedRows.filter((row) => row.media_type === MediaType.tv).length);
  const watchedEpisodeCount = [...watchedEpisodesByMedia.values()].reduce((sum, count) => sum + count, 0);

  return {
    schemaVersion: 1,
    scope: {
      period: 'all',
      mediaType,
      basis: 'CURRENT_TRACKED_STATE',
    },
    summary: {
      watchedTitleCount: eligibleTitleCount,
      movieCount: watchedRows.filter((row) => row.media_type === MediaType.movie).length,
      tvSeriesCount: watchedRows.filter((row) => row.media_type === MediaType.tv).length,
      watchedEpisodeCount,
      personalRating: {
        average: ratingSampleSize > 0 ? Number((totalRating / ratingSampleSize).toFixed(1)) : null,
        sampleSize: ratingSampleSize,
      },
    },
    viewingSignature: {
      status: eligibleTitleCount >= VIEWING_SIGNATURE_MINIMUM ? 'AVAILABLE' : 'INSUFFICIENT_DATA',
      topGenre: genres[0] ?? null,
      topMovieDirector: movieDirectors[0] ?? null,
      topTvCreator: tvCreators[0] ?? null,
      topCastMember: cast[0] ?? null,
    },
    rankings: {
      genres,
      cast,
      movieDirectors,
      tvCreators,
      likedGenres: toRanking(likedGenreCounter, likedRows.filter((row) => row.media.genres.length > 0).length),
      highestRatedGenres: toHighestRatedRanking(ratedGenreCounter),
    },
    distributions: {
      mediaTypes: getDistribution(mediaTypeCounter, eligibleTitleCount),
      releaseDecades: getDistribution(decadeCounter, eligibleTitleCount),
      originalLanguages: getDistribution(languageCounter, eligibleTitleCount),
    },
    coverage: {
      eligibleTitleCount,
      genres: getCoverage(genreCoveredTitleCount, eligibleTitleCount),
      credits: getCoverage(creditCoveredTitleCount, eligibleTitleCount),
      runtime: getCoverage(runtimeCoveredTitleCount, eligibleTitleCount),
    },
    methodology: {
      genreSharesOverlap: true,
      castBillingLimit: CAST_BILLING_LIMIT,
      titleCountingMode: 'DISTINCT_TITLES',
      tvPeopleWeighting: 'ONE_PER_SERIES',
    },
    computedAt: new Date().toISOString(),
  };
};
